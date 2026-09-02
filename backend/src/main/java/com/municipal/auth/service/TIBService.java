// TIBService.java - Version complète finale
package com.municipal.auth.service;

import com.municipal.auth.dto.request.AvisTIBRequest;
import com.municipal.auth.dto.response.AvisTIBResponse;
import com.municipal.auth.dto.response.TIBResponse;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TIBService {

    private final AvisTIBRepository avisTIBRepository;
    private final BienImmobilierRepository bienImmobilierRepository;
    private final CategorieTIBRepository categorieTIBRepository;
    private final ValeurVenaleRepository valeurVenaleRepository;
    private final ParametreTIBRepository parametreTIBRepository;
    private final UserRepository userRepository;
    private final RueRepository rueRepository;
    private final SecurityService securityService;

    // ────────────────────────────────────────────────────────
    // UTILITAIRES
    // ────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = securityService.getCurrentUsername();
        if (email == null) {
            log.error("Aucun utilisateur authentifié");
            throw new RuntimeException("Utilisateur non authentifié");
        }
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> {
                    log.error("Utilisateur non trouvé avec email: {}", email);
                    return new RuntimeException("Utilisateur non trouvé");
                });
    }

    private ParametreTIB getParametres() {
        return parametreTIBRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    ParametreTIB p = new ParametreTIB();
                    p.setFraisAdministratifs(10.0);
                    p.setCoefficientTIB(0.02);
                    p.setDelaiPaiementJours(30);
                    return p;
                });
    }

    private SourceDossier convertSourceTIBToSourceDossier(SourceTIB source) {
        if (source == null) return SourceDossier.DECLARATION;
        switch (source) {
            case DECLARATION_PROPRIETAIRE:
                return SourceDossier.DECLARATION;
            case RECENSEMENT_MUNICIPAL:
                return SourceDossier.RECENSEMENT;
            case CONTROLE_TERRAIN:
                return SourceDossier.CONTROLE;
            default:
                return SourceDossier.AUTRE;
        }
    }

    private String generateCodeTIB(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("TIB-%d-%06d", anneeFiscale, count);
    }

    private String generateNumeroAvis(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("AVIS-%d-%06d", anneeFiscale, count);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 1 : RUES POUR TIB
    // ────────────────────────────────────────────────────────

    /**
     * Récupère toutes les rues pour le calcul TIB
     */
    public List<Rue> getRuesForTIB() {
        log.info("Récupération des rues pour TIB");
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            log.error("Aucune municipalité affectée à l'utilisateur");
            throw new RuntimeException("Aucune municipalité affectée");
        }
        return user.getMunicipalite().getSecteurs().stream()
                .flatMap(secteur -> secteur.getRues().stream())
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────
    // SECTION 2 : INFORMATIONS TIB D'UNE RUE
    // ────────────────────────────────────────────────────────

    /**
     * Récupère les informations TIB d'une rue
     */
    public TIBResponse getTIBInfo(Long rueId) {
        log.info("Récupération des informations TIB pour la rue: {}", rueId);
        User user = getCurrentUser();
        Rue rue = rueRepository.findById(rueId)
                .orElseThrow(() -> {
                    log.error("Rue non trouvée avec ID: {}", rueId);
                    return new RuntimeException("Rue non trouvée");
                });

        if (!rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: la rue n'appartient pas à la municipalité de l'utilisateur");
            throw new RuntimeException("Accès refusé");
        }

        return buildTIBResponse(rue, null);
    }

    /**
     * Calcule le montant TIB pour une rue et une superficie
     */
    public TIBResponse calculerTIB(Long rueId, Double superficie) {
        log.info("Calcul TIB - rueId: {}, superficie: {}", rueId, superficie);
        User user = getCurrentUser();
        Rue rue = rueRepository.findById(rueId)
                .orElseThrow(() -> {
                    log.error("Rue non trouvée avec ID: {}", rueId);
                    return new RuntimeException("Rue non trouvée");
                });

        if (!rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: la rue n'appartient pas à la municipalité de l'utilisateur");
            throw new RuntimeException("Accès refusé");
        }

        return buildTIBResponse(rue, superficie);
    }

    /**
     * Construit la réponse TIB avec les calculs
     */
    private TIBResponse buildTIBResponse(Rue rue, Double superficie) {
        ParametreTIB parametres = getParametres();

        TIBResponse response = new TIBResponse();

        // Informations de la rue
        response.setRueId(rue.getId());
        response.setRueNom(rue.getNom());
        response.setSecteurNom(rue.getSecteur().getNom());
        response.setMunicipaliteNom(rue.getSecteur().getMunicipalite().getNom());

        // Données pour le calcul
        response.setPrixReferenceM2(rue.getPrixReferenceM2());
        response.setTauxBase(parametres.getCoefficientTIB());
        response.setTaux(rue.getTaux());
        response.setNbCriteresCoches(rue.getNbCriteresCoches());

        // Équipements
        response.setEclairagePublic(rue.getEclairagePublic());
        response.setAssainissement(rue.getAssainissement());
        response.setEauPotable(rue.getEauPotable());
        response.setElectricite(rue.getElectricite());
        response.setVoirie(rue.getVoirie());
        response.setProprete(rue.getProprete());
        response.setAutreCritere(rue.getAutreCritere());
        response.setAutreCritereDetails(rue.getAutreCritereDetails());

        // Coordonnées fictives pour la carte
        response.setLatitude(36.8190 + (rue.getId() * 0.0001));
        response.setLongitude(10.1658 + (rue.getId() * 0.0001));

        // Calcul du montant si superficie fournie
        if (superficie != null && superficie > 0) {
            Double prixRef = rue.getPrixReferenceM2();
            Double taux = rue.getTaux();
            Double tauxBase = parametres.getCoefficientTIB();
            Double frais = parametres.getFraisAdministratifs();
            Double montantTIB = prixRef * superficie * tauxBase * taux;
            Double taxeTotale = montantTIB + frais;

            response.setSuperficie(superficie);
            response.setMontantTIB(montantTIB);
            response.setTaxeTotale(taxeTotale);
            response.setMontantFormate(String.format("%.3f DT", montantTIB));
            response.setTaxeTotaleFormate(String.format("%.3f DT", taxeTotale));
        }

        return response;
    }

    // ────────────────────────────────────────────────────────
    // SECTION 3 : GÉNÉRATION D'AVIS TIB
    // ────────────────────────────────────────────────────────

    /**
     * Génère un avis TIB complet
     */
    @Transactional
    public AvisTIBResponse genererAvis(AvisTIBRequest request) {
        log.info("=== GÉNÉRATION AVIS TIB ===");
        log.info("Bien ID: {}", request.getBienId());
        log.info("Année fiscale: {}", request.getAnneeFiscale());
        log.info("Catégorie TIB ID: {}", request.getCategorieTIBId());

        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            log.error("Aucune municipalité affectée à l'utilisateur");
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // 1. Récupérer le bien
        BienImmobilier bien = bienImmobilierRepository.findById(request.getBienId())
                .orElseThrow(() -> {
                    log.error("Bien non trouvé avec ID: {}", request.getBienId());
                    return new RuntimeException("Bien non trouvé");
                });

        if (!bien.getRue().getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: le bien n'appartient pas à la municipalité de l'utilisateur");
            throw new RuntimeException("Accès refusé - Ce bien n'appartient pas à votre municipalité");
        }

        // 2. Récupérer la catégorie TIB
        CategorieTIB categorie = categorieTIBRepository.findById(request.getCategorieTIBId())
                .orElseThrow(() -> {
                    log.error("Catégorie TIB non trouvée avec ID: {}", request.getCategorieTIBId());
                    return new RuntimeException("Catégorie TIB non trouvée");
                });

        // 3. Récupérer les paramètres
        ParametreTIB parametres = getParametres();

        // 4. Calculs
        Double prixRef = categorie.getPrixReferenceM2();
        Double surface = request.getSurface();
        Double taux = bien.getTauxTIB() != null ? bien.getTauxTIB() : 0.08;
        Double tauxBase = parametres.getCoefficientTIB();
        Double frais = parametres.getFraisAdministratifs();
        Double montantTIB = prixRef * surface * tauxBase * taux;
        Double taxeTotale = montantTIB + frais;

        // 5. Génération des codes
        String codeTIB = generateCodeTIB(request.getAnneeFiscale());
        String numeroAvis = generateNumeroAvis(request.getAnneeFiscale());

        // 6. Dates
        LocalDate dateGeneration = LocalDate.now();
        LocalDate dateLimite = dateGeneration.plusDays(parametres.getDelaiPaiementJours());
        LocalDate dateDebutImposition = LocalDate.of(request.getAnneeFiscale(), 1, 1);

        // 7. Vérifier les doublons (avec variables final)
        final Long bienId = bien.getId();
        final Integer anneeFiscale = request.getAnneeFiscale();

        List<AvisTIB> existingAvis = avisTIBRepository.findByProprietaireIdAndAnneeFiscale(
                bien.getProprietaire().getId(), anneeFiscale);

        existingAvis.stream()
                .filter(a -> a.getBien().getId().equals(bienId))
                .findFirst()
                .ifPresent(ancienAvis -> {
                    log.warn("Un avis existe déjà pour ce bien en {}: ID={}, Code={}",
                            anneeFiscale, ancienAvis.getId(), ancienAvis.getCodeTib());
                    log.info("Suppression de l'ancien avis");
                    avisTIBRepository.delete(ancienAvis);
                });

        // 8. Construction de l'avis
        AvisTIB avis = new AvisTIB();

        // Section 1 - Informations administratives
        avis.setCodeTib(codeTIB);
        avis.setNumeroAvis(numeroAvis);
        avis.setSourceDossier(convertSourceTIBToSourceDossier(request.getSource()));
        avis.setAnneeFiscale(request.getAnneeFiscale());
        avis.setDateDebutImposition(dateDebutImposition);
        avis.setDateCreation(dateGeneration);
        avis.setDateLimite(dateLimite);
        avis.setStatut(StatutPaiement.EN_ATTENTE);

        // Section 2 - Bien / Propriétaire / Rue
        avis.setBien(bien);
        avis.setProprietaire(bien.getProprietaire());
        avis.setRue(bien.getRue());

        // Section 3 - Calcul
        avis.setCategorie(categorie);
        avis.setPrixReferenceM2(prixRef);
        avis.setSurface(surface);
        avis.setTauxRue(taux);
        avis.setCoefficient(parametres.getCoefficientTIB());
        avis.setMontantTib(montantTIB);
        avis.setFraisAdministratifs(frais);
        avis.setTaxeTotale(taxeTotale);

        // Section 4 - Avis
        avis.setObservations(request.getObservations());

        // 9. Ajouter la valeur vénale si présente
        if (request.getValeurVenaleId() != null) {
            AvisTIB finalAvis = avis;
            valeurVenaleRepository.findById(request.getValeurVenaleId())
                    .ifPresent(valeurVenale -> {
                        finalAvis.setValeurVenale(valeurVenale);
                        log.info("Valeur vénale ajoutée: Zone={}, Valeur={} DT/m²",
                                valeurVenale.getZone(), valeurVenale.getValeurVenaleM2());
                    });
        }

        // 10. Sauvegarde
        try {
            avis = avisTIBRepository.save(avis);
            log.info("✅ Avis TIB sauvegardé avec succès: ID={}, Numéro={}",
                    avis.getId(), avis.getNumeroAvis());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la sauvegarde de l'avis: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la sauvegarde de l'avis: " + e.getMessage());
        }

        return mapToResponse(avis);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 4 : GESTION DES AVIS
    // ────────────────────────────────────────────────────────

    /**
     * Marque un avis comme payé
     */
    @Transactional
    public AvisTIBResponse marquerPaye(Long avisId) {
        log.info("=== MARQUER AVIS PAYÉ ===");
        log.info("Avis ID: {}", avisId);

        User user = getCurrentUser();
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> {
                    log.error("Avis non trouvé avec ID: {}", avisId);
                    return new RuntimeException("Avis non trouvé");
                });

        if (!avis.getProprietaire().getRue().getSecteur().getMunicipalite().getId()
                .equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: l'avis n'appartient pas à la municipalité de l'utilisateur");
            throw new RuntimeException("Accès refusé");
        }

        if (avis.getStatut() == StatutPaiement.PAYE) {
            log.warn("L'avis {} est déjà payé", avis.getNumeroAvis());
            throw new RuntimeException("Cet avis est déjà payé");
        }

        avis.setStatut(StatutPaiement.PAYE);
        avis.setDateAvis(LocalDate.now());
        avis = avisTIBRepository.save(avis);

        log.info("✅ Avis marqué comme payé: {}", avis.getNumeroAvis());
        return mapToResponse(avis);
    }

    /**
     * Récupère les avis d'un propriétaire
     */
    public List<AvisTIBResponse> getAvisByProprietaire(Long proprietaireId) {
        log.info("=== RÉCUPÉRATION AVIS POUR PROPRIÉTAIRE ===");
        log.info("Propriétaire ID: {}", proprietaireId);

        List<AvisTIB> avisList = avisTIBRepository.findByProprietaireIdOrderByDateCreationEnrDesc(proprietaireId);
        log.info("📋 {} avis trouvés pour le propriétaire {}", avisList.size(), proprietaireId);

        return avisList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les détails d'un avis
     */
    public AvisTIBResponse getAvisDetails(Long avisId) {
        log.info("=== RÉCUPÉRATION DÉTAILS AVIS ===");
        log.info("Avis ID: {}", avisId);

        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> {
                    log.error("Avis non trouvé avec ID: {}", avisId);
                    return new RuntimeException("Avis non trouvé");
                });

        return mapToResponse(avis);
    }

    /**
     * Supprime un avis (uniquement si non payé)
     */
    @Transactional
    public void supprimerAvis(Long avisId) {
        log.info("=== SUPPRESSION AVIS TIB ===");
        log.info("Avis ID: {}", avisId);

        User user = getCurrentUser();
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> {
                    log.error("Avis non trouvé avec ID: {}", avisId);
                    return new RuntimeException("Avis non trouvé");
                });

        if (!avis.getProprietaire().getRue().getSecteur().getMunicipalite().getId()
                .equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: l'avis n'appartient pas à la municipalité de l'utilisateur");
            throw new RuntimeException("Accès refusé");
        }

        if (avis.getStatut() == StatutPaiement.PAYE) {
            log.warn("Impossible de supprimer l'avis {} car il est déjà payé", avis.getNumeroAvis());
            throw new RuntimeException("Impossible de supprimer un avis déjà payé");
        }

        avisTIBRepository.deleteById(avisId);
        log.info("✅ Avis supprimé avec succès: {}", avisId);
    }

    // ────────────────────────────────────────────────────────
    // MAPPING
    // ────────────────────────────────────────────────────────

    /**
     * Map AvisTIB vers AvisTIBResponse
     */
    private AvisTIBResponse mapToResponse(AvisTIB avis) {
        AvisTIBResponse response = new AvisTIBResponse();

        // Section 1 - Informations administratives
        response.setId(avis.getId());
        response.setCodeTib(avis.getCodeTib());
        response.setNumeroAvis(avis.getNumeroAvis());
        response.setSourceDossier(avis.getSourceDossier());
        response.setSourceDossierLabel(avis.getSourceDossier() != null ?
                avis.getSourceDossier().getLabel() : null);
        response.setAnneeFiscale(avis.getAnneeFiscale());
        response.setDateCreation(avis.getDateCreation());
        response.setDateDebutImposition(avis.getDateDebutImposition());
        response.setDateLimite(avis.getDateLimite());
        response.setStatut(avis.getStatut());
        response.setStatutLabel(avis.getStatut().getLabel());
        response.setObservations(avis.getObservations());

        // Section 2 - Bien / Propriétaire / Rue
        if (avis.getBien() != null) {
            response.setBienId(avis.getBien().getId());
            response.setBienAdresse(avis.getBien().getAdresse());
            response.setTypeBien(avis.getBien().getTypeBien());
        }

        if (avis.getProprietaire() != null) {
            response.setProprietaireId(avis.getProprietaire().getId());
            response.setProprietaireNom(avis.getProprietaire().getNom() + " " +
                    avis.getProprietaire().getPrenom());
            response.setProprietaireCin(avis.getProprietaire().getCin());
        }

        if (avis.getRue() != null) {
            response.setRueId(avis.getRue().getId());
            response.setRueNom(avis.getRue().getNom());
            if (avis.getRue().getSecteur() != null) {
                response.setSecteurNom(avis.getRue().getSecteur().getNom());
                if (avis.getRue().getSecteur().getMunicipalite() != null) {
                    response.setMunicipaliteNom(avis.getRue().getSecteur().getMunicipalite().getNom());
                }
            }
        }

        // Section 3 - Calcul
        if (avis.getCategorie() != null) {
            response.setCategorieLibelle(avis.getCategorie().getLibelle());
        }
        response.setPrixReferenceM2(avis.getPrixReferenceM2());
        response.setSurface(avis.getSurface());
        response.setTauxRue(avis.getTauxRue());
        response.setCoefficient(avis.getCoefficient());
        response.setMontantTib(avis.getMontantTib());
        response.setFraisAdministratifs(avis.getFraisAdministratifs());
        response.setTaxeTotale(avis.getTaxeTotale());

        // Section 4 - Statut et jours restants
        if (avis.getStatut() == StatutPaiement.EN_ATTENTE && avis.getDateLimite() != null) {
            long joursRestants = LocalDate.now().until(avis.getDateLimite()).getDays();
            response.setJoursRestants(joursRestants);
            response.setEstEnRetard(joursRestants < 0);

            // Mettre à jour le statut si en retard
            if (joursRestants < 0) {
                avis.setStatut(StatutPaiement.EN_RETARD);
                avisTIBRepository.save(avis);
                response.setStatut(StatutPaiement.EN_RETARD);
                response.setStatutLabel(StatutPaiement.EN_RETARD.getLabel());
            }
        } else if (avis.getStatut() == StatutPaiement.PAYE) {
            response.setJoursRestants(null);
            response.setEstEnRetard(false);
        } else {
            response.setJoursRestants(null);
            response.setEstEnRetard(true);
        }

        return response;
    }
}