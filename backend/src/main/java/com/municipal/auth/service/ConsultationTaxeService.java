package com.municipal.auth.service;

import com.municipal.auth.dto.request.PaiementRequest;
import com.municipal.auth.dto.response.AnneeImpositionResponse;
import com.municipal.auth.dto.response.ConsultationTaxeResponse;
import com.municipal.auth.dto.response.QuittanceResponse;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.AvisTIBRepository;
import com.municipal.auth.repository.AvisTNBRepository;
import com.municipal.auth.repository.PaiementRepository;
import com.municipal.auth.repository.RecetteRepository;
import com.municipal.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationTaxeService {

    private final AvisTIBRepository avisTIBRepository;
    private final AvisTNBRepository avisTNBRepository;
    private final PaiementRepository paiementRepository;
    private final RecetteRepository recetteRepository;
    private final UserRepository userRepository;
    private final AdminTIBService adminTIBService;
    private final RecetteService recetteService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ── Consultation TIB ──────────────────────────────────────────────────────

    public ConsultationTaxeResponse consulterParCodeTib(String codeTib) {
        AvisTIB reference = avisTIBRepository.findByCodeTib(codeTib)
                .orElseThrow(() -> new RuntimeException("Aucun dossier trouvé pour le code TIB : " + codeTib));

        BienImmobilier bien = reference.getBien();
        Proprietaire proprietaire = reference.getProprietaire();
        Rue rue = reference.getRue();
        User user = getCurrentUser();

        verifierAcces(rue, user);

        List<AvisTIB> tousLesAvis = avisTIBRepository
                .findByProprietaireIdAndBienIdOrderByAnneeFiscaleAsc(proprietaire.getId(), bien.getId());
        Map<Integer, AvisTIB> parAnnee = tousLesAvis.stream()
                .collect(Collectors.toMap(AvisTIB::getAnneeFiscale, a -> a, (a, b) -> a));

        List<Recette> recettes = recetteRepository.findByBienIdAndTypeOrderByAnneeFiscaleAsc(bien.getId(), TypeRecette.TIB);
        Map<Integer, Recette> recettesParAnnee = recettes.stream()
                .collect(Collectors.toMap(Recette::getAnneeFiscale, r -> r, (a, b) -> a));

        int anneeDebut = reference.getDateDebutImposition().getYear();
        int anneeActuelle = LocalDate.now().getYear();
        if (anneeDebut > anneeActuelle) anneeDebut = anneeActuelle;

        ParametreTIB parametre = adminTIBService.getOrCreateParametre();
        CategorieTIB categorie = reference.getCategorie();
        Double prixRef = categorie != null ? categorie.getPrixReferenceM2() : reference.getPrixReferenceM2();

        List<AnneeImpositionResponse> annees = new ArrayList<>();
        double totalPaye = 0.0;
        double totalRestant = 0.0;

        for (int annee = anneeDebut; annee <= anneeActuelle; annee++) {
            AnneeImpositionResponse dto = new AnneeImpositionResponse();
            dto.setAnnee(annee);

            AvisTIB avis = parAnnee.get(annee);
            Recette recette = recettesParAnnee.get(annee);

            if (avis != null) {
                double totalPayeAvis = recette != null ? recette.getMontantPaye() : 0.0;
                double montantRestant = avis.getTaxeTotale() - totalPayeAvis;

                dto.setGenere(true);
                dto.setEstime(false);
                dto.setAvisId(avis.getId());
                dto.setCodeTib(avis.getCodeTib());
                dto.setNumeroAvis(avis.getNumeroAvis());
                dto.setMontant(avis.getTaxeTotale());
                dto.setMontantPaye(totalPayeAvis);
                dto.setMontantRestant(montantRestant);
                dto.setDateAvis(avis.getDateAvis());
                dto.setDateLimite(avis.getDateLimite());

                StatutPaiement statutCourant = determineStatut(avis, totalPayeAvis);
                dto.setStatut(statutCourant.name());
                dto.setStatutLabel(statutCourant.getLabel());

                List<Paiement> paiements = recette != null
                        ? paiementRepository.findByRecetteIdOrderByDatePaiementDesc(recette.getId())
                        : new ArrayList<>();
                dto.setPaiements(mapPaiements(paiements));

                if (statutCourant == StatutPaiement.PAYE) {
                    totalPaye += avis.getTaxeTotale();
                } else {
                    totalRestant += montantRestant;
                }
            } else {
                double coefficient = parametre.getCoefficientTIB() != null ? parametre.getCoefficientTIB() : 0.02;
                double frais = parametre.getFraisAdministratifs() != null ? parametre.getFraisAdministratifs() : 0.0;
                double tauxRue = reference.getTauxRue() != null ? reference.getTauxRue() : 0.0;
                double surface = reference.getSurface() != null ? reference.getSurface() : 0.0;
                double montantEstime = (prixRef != null ? prixRef : 0.0) * surface * coefficient * tauxRue;
                double totalEstime = montantEstime + frais;

                dto.setGenere(false);
                dto.setEstime(true);
                dto.setMontant(round(totalEstime));
                dto.setMontantPaye(0.0);
                dto.setMontantRestant(round(totalEstime));
                dto.setStatut("NON_GENERE");
                dto.setStatutLabel("Non généré");
                dto.setPaiements(new ArrayList<>());

                totalRestant += totalEstime;
            }

            annees.add(dto);
        }

        ConsultationTaxeResponse response = new ConsultationTaxeResponse();
        response.setCodeTaxe(reference.getCodeTib());
        response.setTypeTaxe("TIB");
        response.setProprietaireId(proprietaire.getId());
        response.setProprietaireNom(proprietaire.getNom() + " " + proprietaire.getPrenom());
        response.setProprietaireCin(proprietaire.getCin());
        response.setAdresse(bien.getAdresse());
        response.setMunicipaliteNom(rue.getSecteur().getMunicipalite().getNom());
        response.setSecteurNom(rue.getSecteur().getNom());
        response.setBienId(bien.getId());
        response.setCategorieId(categorie != null ? categorie.getId() : null);
        response.setSurface(reference.getSurface());
        response.setValeurVenaleId(reference.getValeurVenale() != null ? reference.getValeurVenale().getId() : null);
        response.setDateDebutImposition(reference.getDateDebutImposition());
        response.setAnneeFiscaleActuelle(anneeActuelle);
        response.setAnneesImposition(annees);
        response.setNbAnneesTotal(annees.size());
        response.setNbAnneesPayees((int) annees.stream().filter(a -> "PAYE".equals(a.getStatut())).count());
        response.setNbAnneesNonPayees((int) annees.stream().filter(a -> !"PAYE".equals(a.getStatut())).count());
        response.setTotalPaye(round(totalPaye));
        response.setTotalRestant(round(totalRestant));

        return response;
    }

    // ── Enregistrement d'un paiement TIB ─────────────────────────────────────

    @Transactional
    public AnneeImpositionResponse enregistrerPaiementTib(String codeTib, Integer annee, PaiementRequest request) {
        AvisTIB avis = avisTIBRepository.findByCodeTib(codeTib)
                .orElseThrow(() -> new RuntimeException("Avis TIB non trouvé pour le code : " + codeTib));

        if (!avis.getAnneeFiscale().equals(annee)) {
            throw new RuntimeException("L'année ne correspond pas à l'avis.");
        }

        User user = getCurrentUser();
        verifierAcces(avis.getRue(), user);

        Recette recette = recetteRepository
                .findByBienIdAndTypeAndAnneeFiscale(avis.getBien().getId(), TypeRecette.TIB, annee)
                .orElseGet(() -> recetteService.creerRecette(
                        TypeRecette.TIB, avis.getId(), avis.getNumeroAvis(),
                        avis.getProprietaire(), avis.getRue(), avis.getBien(),
                        avis.getDateDebutImposition(), avis.getAnneeFiscale(),
                        avis.getTaxeTotale(), avis.getDateAvis(), avis.getDateLimite()));

        double restant = avis.getTaxeTotale() - recette.getMontantPaye();
        if (request.getMontant() > restant + 0.001) {
            throw new RuntimeException("Le montant saisi dépasse le restant dû (" + restant + " TND).");
        }

        ModePaiement mode = convertirModePaiement(request.getModePaiement());
        recetteService.enregistrerPaiementAnnee(avis.getNumeroAvis(), annee, request.getMontant(), mode);

        Recette recetteMaj = recetteRepository
                .findByBienIdAndTypeAndAnneeFiscale(avis.getBien().getId(), TypeRecette.TIB, annee)
                .orElseThrow(() -> new RuntimeException("Recette introuvable après paiement"));

        double nouveauTotalPaye = recetteMaj.getMontantPaye();
        avis.setStatut(Math.abs(nouveauTotalPaye - avis.getTaxeTotale()) < 0.001
                ? StatutPaiement.PAYE : StatutPaiement.PARTIELLEMENT_PAYE);
        avisTIBRepository.save(avis);

        List<Paiement> paiements = paiementRepository.findByRecetteIdOrderByDatePaiementDesc(recetteMaj.getId());
        return buildAnneeResponse(avis, paiements, nouveauTotalPaye);
    }

    // ── Génération de quittance ──────────────────────────────────────────────

    public QuittanceResponse getQuittanceTib(Long avisId) {
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));

        User user = getCurrentUser();
        verifierAcces(avis.getRue(), user);

        Recette recette = recetteRepository
                .findByBienIdAndTypeAndAnneeFiscale(avis.getBien().getId(), TypeRecette.TIB, avis.getAnneeFiscale())
                .orElseThrow(() -> new RuntimeException("Aucune recette associée à cet avis."));

        List<Paiement> paiements = paiementRepository.findByRecetteIdOrderByDatePaiementDesc(recette.getId());
        if (paiements.isEmpty()) {
            throw new RuntimeException("Aucun paiement enregistré pour cet avis.");
        }

        return recetteService.getQuittance(paiements.get(0).getNumeroQuittance());
    }

    // ── Génération d'un avis pour une année manquante ─────────────────────────

    @Transactional
    public AnneeImpositionResponse genererAvisPourAnnee(String codeTibReference, Integer annee) {
        User user = getCurrentUser();

        AvisTIB reference = avisTIBRepository.findByCodeTib(codeTibReference)
                .orElseThrow(() -> new RuntimeException("Dossier de référence introuvable"));

        BienImmobilier bien = reference.getBien();
        Proprietaire proprietaire = reference.getProprietaire();
        verifierAcces(bien.getRue(), user);

        boolean existeDeja = avisTIBRepository
                .findByProprietaireIdAndBienIdOrderByAnneeFiscaleAsc(proprietaire.getId(), bien.getId())
                .stream()
                .anyMatch(a -> a.getAnneeFiscale().equals(annee));
        if (existeDeja) {
            throw new RuntimeException("Un avis existe déjà pour l'année " + annee);
        }

        ParametreTIB parametre = adminTIBService.getOrCreateParametre();
        CategorieTIB categorie = reference.getCategorie();
        Double prixRef = categorie != null ? categorie.getPrixReferenceM2() : reference.getPrixReferenceM2();
        Double surface = reference.getSurface();
        Double tauxRue = bien.getTauxTIB() != null ? bien.getTauxTIB() : reference.getTauxRue();
        Double coefficient = parametre.getCoefficientTIB();
        Double frais = parametre.getFraisAdministratifs();

        double montantTib = (prixRef != null ? prixRef : 0.0) * (surface != null ? surface : 0.0)
                * (coefficient != null ? coefficient : 0.02) * (tauxRue != null ? tauxRue : 0.0);
        double taxeTotale = montantTib + (frais != null ? frais : 0.0);

        LocalDate dateAvis = LocalDate.now();
        Integer delai = parametre.getDelaiPaiementJours() != null ? parametre.getDelaiPaiementJours() : 30;
        LocalDate dateLimite = dateAvis.plusDays(delai);

        AvisTIB nouvelAvis = new AvisTIB();
        nouvelAvis.setCodeTib(genererCodeTib(annee));
        nouvelAvis.setNumeroAvis(genererNumeroAvis(annee));
        nouvelAvis.setSourceDossier(reference.getSourceDossier() != null ? reference.getSourceDossier() : SourceDossier.AUTRE);
        nouvelAvis.setAnneeFiscale(annee);
        nouvelAvis.setDateCreation(LocalDate.now());
        nouvelAvis.setDateDebutImposition(reference.getDateDebutImposition());
        nouvelAvis.setBien(bien);
        nouvelAvis.setProprietaire(proprietaire);
        nouvelAvis.setRue(bien.getRue());
        nouvelAvis.setCategorie(categorie);
        nouvelAvis.setPrixReferenceM2(prixRef);
        nouvelAvis.setSurface(surface);
        nouvelAvis.setTauxRue(tauxRue);
        nouvelAvis.setCoefficient(coefficient);
        nouvelAvis.setMontantTib(round(montantTib));
        nouvelAvis.setFraisAdministratifs(frais);
        nouvelAvis.setTaxeTotale(round(taxeTotale));
        nouvelAvis.setValeurVenale(reference.getValeurVenale());
        nouvelAvis.setDateAvis(dateAvis);
        nouvelAvis.setDateLimite(dateLimite);
        nouvelAvis.setStatut(StatutPaiement.EN_ATTENTE);
        nouvelAvis.setObservations("Généré depuis la Consultation des Recettes (dossier " + codeTibReference + ")");

        nouvelAvis = avisTIBRepository.save(nouvelAvis);

        recetteService.creerRecette(
                TypeRecette.TIB,
                nouvelAvis.getId(),
                nouvelAvis.getNumeroAvis(),
                nouvelAvis.getCodeTib(),           // ✅ ajouté : permet la recherche par Code TIB
                nouvelAvis.getProprietaire(),
                nouvelAvis.getRue(),
                nouvelAvis.getBien(),
                nouvelAvis.getDateDebutImposition(),
                nouvelAvis.getAnneeFiscale(),
                nouvelAvis.getTaxeTotale(),
                nouvelAvis.getDateAvis(),
                nouvelAvis.getDateLimite()
        );

        log.info("✅ Avis TIB généré depuis la consultation: {} (année {})", nouvelAvis.getCodeTib(), annee);

        AnneeImpositionResponse dto = new AnneeImpositionResponse();
        dto.setAnnee(annee);
        dto.setGenere(true);
        dto.setEstime(false);
        dto.setAvisId(nouvelAvis.getId());
        dto.setCodeTib(nouvelAvis.getCodeTib());
        dto.setNumeroAvis(nouvelAvis.getNumeroAvis());
        dto.setMontant(nouvelAvis.getTaxeTotale());
        dto.setMontantPaye(0.0);
        dto.setMontantRestant(nouvelAvis.getTaxeTotale());
        dto.setDateAvis(nouvelAvis.getDateAvis());
        dto.setDateLimite(nouvelAvis.getDateLimite());
        dto.setStatut(nouvelAvis.getStatut().name());
        dto.setStatutLabel(nouvelAvis.getStatut().getLabel());
        dto.setPaiements(new ArrayList<>());
        return dto;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void verifierAcces(Rue rue, User user) {
        if (user.getMunicipalite() == null
                || !rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }
    }

    private StatutPaiement determineStatut(AvisTIB avis, double totalPaye) {
        if (totalPaye >= avis.getTaxeTotale() - 0.001) {
            return StatutPaiement.PAYE;
        } else if (totalPaye > 0) {
            return StatutPaiement.PARTIELLEMENT_PAYE;
        } else {
            if (avis.getDateLimite() != null && LocalDate.now().isAfter(avis.getDateLimite())) {
                return StatutPaiement.EN_RETARD;
            }
            return StatutPaiement.EN_ATTENTE;
        }
    }

    private AnneeImpositionResponse buildAnneeResponse(AvisTIB avis, List<Paiement> paiements, double totalPaye) {
        AnneeImpositionResponse dto = new AnneeImpositionResponse();
        dto.setAnnee(avis.getAnneeFiscale());
        dto.setGenere(true);
        dto.setEstime(false);
        dto.setAvisId(avis.getId());
        dto.setCodeTib(avis.getCodeTib());
        dto.setNumeroAvis(avis.getNumeroAvis());
        dto.setMontant(avis.getTaxeTotale());
        dto.setMontantPaye(totalPaye);
        dto.setMontantRestant(avis.getTaxeTotale() - totalPaye);
        dto.setDateAvis(avis.getDateAvis());
        dto.setDateLimite(avis.getDateLimite());
        StatutPaiement statut = determineStatut(avis, totalPaye);
        dto.setStatut(statut.name());
        dto.setStatutLabel(statut.getLabel());
        dto.setPaiements(mapPaiements(paiements));
        return dto;
    }

    private List<AnneeImpositionResponse.PaiementSummary> mapPaiements(List<Paiement> paiements) {
        return paiements.stream()
                .map(p -> {
                    AnneeImpositionResponse.PaiementSummary s = new AnneeImpositionResponse.PaiementSummary();
                    s.setMontantPaye(p.getMontant());
                    s.setModePaiement(p.getModePaiement() != null ? p.getModePaiement().name() : null);
                    s.setDatePaiement(p.getDatePaiement());
                    s.setReference(p.getNumeroQuittance());
                    s.setAgentNom(p.getAgentNom());
                    return s;
                })
                .collect(Collectors.toList());
    }

    private ModePaiement convertirModePaiement(String mode) {
        if (mode == null) return ModePaiement.ESPECES;
        try {
            return ModePaiement.valueOf(mode.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ModePaiement.ESPECES;
        }
    }

    private Double round(double valeur) {
        return Math.round(valeur * 1000.0) / 1000.0;
    }

    private String genererCodeTib(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("TIB-%d-%06d", anneeFiscale, count);
    }

    private String genererNumeroAvis(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("AVIS-%d-%06d", anneeFiscale, count);
    }

    // ── Consultation TNB (à implémenter de manière similaire) ──────────────

    public ConsultationTaxeResponse consulterParCodeTnb(String codeTnb) {
        throw new UnsupportedOperationException("Consultation TNB en cours de développement");
    }

    @Transactional
    public AnneeImpositionResponse enregistrerPaiementTnb(String codeTnb, Integer annee, PaiementRequest request) {
        throw new UnsupportedOperationException("Paiement TNB en cours de développement");
    }

    public QuittanceResponse getQuittanceTnb(Long avisId) {
        throw new UnsupportedOperationException("Quittance TNB en cours de développement");
    }
}