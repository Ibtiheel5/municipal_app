// AvisTIBService.java - Version corrigée
package com.municipal.auth.service;

import com.municipal.auth.dto.request.AvisTIBRequest;
import com.municipal.auth.dto.response.AvisTIBResponse;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvisTIBService {

    private final AvisTIBRepository avisTIBRepository;
    private final BienImmobilierRepository bienImmobilierRepository;
    private final CategorieTIBRepository categorieTIBRepository;
    private final ValeurVenaleRepository valeurVenaleRepository;
    // ✅ Correction: Utiliser ParametreTIBRepository (singulier) au lieu de ParametresTIBRepository
    private final ParametreTIBRepository parametreTIBRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ── Génération d'avis ──────────────────────────────────────────────────────

    @Transactional
    public AvisTIBResponse genererAvis(AvisTIBRequest request) {
        log.info("=== GÉNÉRATION AVIS TIB ===");
        log.info("Bien ID: {}", request.getBienId());
        log.info("Année fiscale: {}", request.getAnneeFiscale());
        log.info("Catégorie TIB ID: {}", request.getCategorieTIBId());

        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // 1. Récupérer le bien
        BienImmobilier bien = bienImmobilierRepository.findById(request.getBienId())
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        if (!bien.getRue().getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé - Ce bien n'appartient pas à votre municipalité");
        }

        // 2. Vérifier les doublons
        List<AvisTIB> existingAvis = avisTIBRepository.findByProprietaireIdAndAnneeFiscale(
                bien.getProprietaire().getId(), request.getAnneeFiscale());

        existingAvis.stream()
                .filter(a -> a.getBien().getId().equals(bien.getId()))
                .findFirst()
                .ifPresent(ancienAvis -> {
                    log.warn("Suppression de l'ancien avis: {}", ancienAvis.getCodeTib());
                    avisTIBRepository.delete(ancienAvis);
                });

        // 3. Récupérer la catégorie TIB
        CategorieTIB categorie = categorieTIBRepository.findById(request.getCategorieTIBId())
                .orElseThrow(() -> new RuntimeException("Catégorie TIB non trouvée"));

        // 4. Récupérer les paramètres
        // ✅ Correction: Utiliser ParametreTIB au lieu de ParametresTIB
        ParametreTIB parametres = parametreTIBRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    ParametreTIB p = new ParametreTIB();
                    p.setFraisAdministratifs(10.0);
                    p.setCoefficientTIB(0.02);
                    p.setDelaiPaiementJours(30);
                    return p;
                });

        // 5. Calculs
        Double prixRef = categorie.getPrixReferenceM2();
        Double surface = request.getSurface();
        Double taux = bien.getTauxTIB() != null ? bien.getTauxTIB() : 0.08;
        Double tauxBase = 0.02; // Taux de base fixe, ou depuis les paramètres
        Double frais = parametres.getFraisAdministratifs();

        Double montantTIB = prixRef * surface * tauxBase * taux;
        Double taxeTotale = montantTIB + frais;

        // 6. Génération des codes
        String codeTIB = generateCodeTIB(request.getAnneeFiscale());
        String numeroAvis = generateNumeroAvis(request.getAnneeFiscale());

        // 7. Dates
        LocalDate dateGeneration = LocalDate.now();
        LocalDate dateLimite = dateGeneration.plusDays(parametres.getDelaiPaiementJours());
        LocalDate dateDebutImposition = LocalDate.of(request.getAnneeFiscale(), 1, 1);

        // 8. Construction de l'avis
        AvisTIB avis = new AvisTIB();
        avis.setCodeTib(codeTIB);
        avis.setNumeroAvis(numeroAvis);
        avis.setSourceDossier(request.getSource() != null ?
                convertSourceTIBToSourceDossier(request.getSource()) : SourceDossier.DECLARATION);
        avis.setAnneeFiscale(request.getAnneeFiscale());
        avis.setDateDebutImposition(dateDebutImposition);
        avis.setDateCreation(dateGeneration);
        avis.setDateLimite(dateLimite);
        avis.setStatut(StatutPaiement.EN_ATTENTE);
        avis.setBien(bien);
        avis.setProprietaire(bien.getProprietaire());
        avis.setRue(bien.getRue());
        avis.setCategorie(categorie);
        avis.setPrixReferenceM2(prixRef);
        avis.setSurface(surface);
        avis.setTauxRue(taux);
        avis.setCoefficient(parametres.getCoefficientTIB());
        avis.setMontantTib(montantTIB);
        avis.setFraisAdministratifs(frais);
        avis.setTaxeTotale(taxeTotale);
        avis.setObservations(request.getObservations());

        // 9. Ajouter la valeur vénale si présente
        if (request.getValeurVenaleId() != null) {
            ValeurVenale valeurVenale = valeurVenaleRepository.findById(request.getValeurVenaleId()).orElse(null);
            if (valeurVenale != null) {
                avis.setValeurVenale(valeurVenale);
            }
        }

        // 10. Sauvegarde
        avis = avisTIBRepository.save(avis);
        log.info("✅ Avis TIB généré: {}", avis.getNumeroAvis());

        return mapToResponse(avis);
    }

    // ── Méthode utilitaire pour convertir SourceTIB → SourceDossier ──────────
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

    // ── Génération des identifiants ───────────────────────────────────────────

    private String generateCodeTIB(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("TIB-%d-%06d", anneeFiscale, count);
    }

    private String generateNumeroAvis(Integer anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("AVIS-%d-%06d", anneeFiscale, count);
    }

    // ── Récupération des avis ─────────────────────────────────────────────────

    public List<AvisTIBResponse> getAvisByProprietaire(Long proprietaireId) {
        log.info("Récupération des avis pour le propriétaire: {}", proprietaireId);
        List<AvisTIB> avis = avisTIBRepository.findByProprietaireIdOrderByDateCreationEnrDesc(proprietaireId);
        return avis.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AvisTIBResponse getAvisDetails(Long avisId) {
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));
        return mapToResponse(avis);
    }

    public Page<AvisTIBResponse> getAvisWithFilters(Long municipaliteId, Integer anneeFiscale,
                                                    StatutPaiement statut, Long rueId,
                                                    String search, Pageable pageable) {
        // Implémentez cette méthode selon vos besoins
        // Pour l'instant, récupération simple
        List<AvisTIB> avisList = avisTIBRepository.rechercher(
                municipaliteId, anneeFiscale, rueId, null, statut);
        // Conversion en Page (à adapter)
        return null;
    }

    // ── Actions sur les avis ──────────────────────────────────────────────────

    @Transactional
    public AvisTIBResponse marquerPaye(Long avisId) {
        log.info("=== MARQUER AVIS PAYÉ ===");
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));

        if (avis.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Cet avis est déjà payé");
        }

        avis.setStatut(StatutPaiement.PAYE);
        avis.setDateAvis(LocalDate.now());
        avis = avisTIBRepository.save(avis);

        log.info("✅ Avis marqué comme payé: {}", avis.getNumeroAvis());
        return mapToResponse(avis);
    }

    @Transactional
    public void supprimerAvis(Long avisId) {
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));

        if (avis.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Impossible de supprimer un avis déjà payé");
        }

        avisTIBRepository.deleteById(avisId);
        log.info("✅ Avis supprimé: {}", avisId);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private AvisTIBResponse mapToResponse(AvisTIB avis) {
        AvisTIBResponse response = new AvisTIBResponse();

        // Identifiants
        response.setId(avis.getId());
        response.setCodeTib(avis.getCodeTib());
        response.setNumeroAvis(avis.getNumeroAvis());

        // Source et dates
        response.setSourceDossier(avis.getSourceDossier());
        response.setSourceDossierLabel(avis.getSourceDossier() != null ?
                avis.getSourceDossier().getLabel() : null);
        response.setAnneeFiscale(avis.getAnneeFiscale());
        response.setDateDebutImposition(avis.getDateDebutImposition());
        response.setDateCreation(avis.getDateCreation());
        response.setDateLimite(avis.getDateLimite());
        response.setStatut(avis.getStatut());
        response.setStatutLabel(avis.getStatut().getLabel());
        response.setObservations(avis.getObservations());

        // Bien immobilier
        if (avis.getBien() != null) {
            response.setBienId(avis.getBien().getId());
            response.setBienAdresse(avis.getBien().getAdresse());
            response.setTypeBien(avis.getBien().getTypeBien());
        }

        // Propriétaire
        if (avis.getProprietaire() != null) {
            response.setProprietaireId(avis.getProprietaire().getId());
            response.setProprietaireNom(avis.getProprietaire().getNom());
            response.setProprietaireCin(avis.getProprietaire().getCin());
        }

        // Rue
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

        // Catégorie TIB
        if (avis.getCategorie() != null) {
            response.setCategorieLibelle(avis.getCategorie().getLibelle());
            response.setPrixReferenceM2(avis.getPrixReferenceM2());
        }

        // Calculs
        response.setSurface(avis.getSurface());
        response.setTauxRue(avis.getTauxRue());
        response.setCoefficient(avis.getCoefficient());
        response.setMontantTib(avis.getMontantTib());
        response.setFraisAdministratifs(avis.getFraisAdministratifs());
        response.setTaxeTotale(avis.getTaxeTotale());

        // Statut et jours restants
        if (avis.getStatut() == StatutPaiement.EN_ATTENTE && avis.getDateLimite() != null) {
            long joursRestants = LocalDate.now().until(avis.getDateLimite()).getDays();
            response.setJoursRestants(joursRestants);
            response.setEstEnRetard(joursRestants < 0);
        } else if (avis.getStatut() == StatutPaiement.PAYE) {
            response.setJoursRestants(null);
            response.setEstEnRetard(false);
        }

        return response;
    }
}