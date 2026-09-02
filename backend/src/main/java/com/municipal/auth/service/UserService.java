// UserService.java - Version complète corrigée avec DTO
package com.municipal.auth.service;

import com.municipal.auth.dto.request.RueRequest;
import com.municipal.auth.dto.request.SecteurRequest;
import com.municipal.auth.dto.response.MunicipaliteResponse;
import com.municipal.auth.dto.response.RueResponse;
import com.municipal.auth.dto.response.SecteurResponse;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.RueRepository;
import com.municipal.auth.repository.SecteurRepository;
import com.municipal.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RueRepository rueRepository;
    private final SecteurRepository secteurRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Récupération de l'utilisateur avec email: {}", email);
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> {
                    log.error("Utilisateur non trouvé avec email: {}", email);
                    return new RuntimeException("Utilisateur non trouvé");
                });
    }

    // ✅ Version corrigée avec DTO
    public MunicipaliteResponse getMaMunicipalite() {
        User user = getCurrentUser();
        log.info("Utilisateur: {}, Municipalité: {}", user.getEmail(), user.getMunicipalite());

        if (user.getMunicipalite() == null) {
            log.error("Aucune municipalité affectée à l'utilisateur: {}", user.getEmail());
            throw new RuntimeException("Aucune municipalité affectée à votre compte. Contactez l'administrateur.");
        }

        Municipalite m = user.getMunicipalite();
        log.info("Municipalité trouvée: {}", m.getNom());

        MunicipaliteResponse response = new MunicipaliteResponse();
        response.setId(m.getId());
        response.setNom(m.getNom());
        response.setDescription(m.getDescription());

        if (m.getSecteurs() != null && !m.getSecteurs().isEmpty()) {
            log.info("✅ {} secteurs trouvés", m.getSecteurs().size());

            response.setSecteurs(m.getSecteurs().stream()
                    .map(this::mapSecteurToResponse)
                    .collect(Collectors.toList())
            );

            // Afficher les détails dans les logs
            response.getSecteurs().forEach(s -> {
                log.info("  Secteur: {} - {} rues", s.getNom(), s.getRues() != null ? s.getRues().size() : 0);
            });
        } else {
            log.warn("⚠️ Aucun secteur trouvé pour la municipalité");
            response.setSecteurs(null);
        }

        return response;
    }

    private SecteurResponse mapSecteurToResponse(Secteur secteur) {
        SecteurResponse response = new SecteurResponse();
        response.setId(secteur.getId());
        response.setNom(secteur.getNom());

        if (secteur.getRues() != null && !secteur.getRues().isEmpty()) {
            response.setRues(secteur.getRues().stream()
                    .map(this::mapRueToResponse)
                    .collect(Collectors.toList())
            );
        } else {
            response.setRues(null);
        }

        return response;
    }

    private RueResponse mapRueToResponse(Rue rue) {
        RueResponse response = new RueResponse();
        response.setId(rue.getId());
        response.setNom(rue.getNom());
        response.setPrixReferenceM2(rue.getPrixReferenceM2());
        response.setTaux(rue.getTaux());
        response.setTauxBase(rue.getTauxBase());
        response.setEtat(rue.getEtat() != null ? rue.getEtat().name() : "BONNE");
        response.setEclairagePublic(rue.getEclairagePublic());
        response.setAssainissement(rue.getAssainissement());
        response.setEauPotable(rue.getEauPotable());
        response.setElectricite(rue.getElectricite());
        response.setVoirie(rue.getVoirie());
        response.setProprete(rue.getProprete());
        response.setAutreCritere(rue.getAutreCritere());
        response.setAutreCritereDetails(rue.getAutreCritereDetails());
        response.setObservations(rue.getObservations());
        response.setPriorite(rue.getPriorite());
        response.setNbCriteresCoches(rue.getNbCriteresCoches());
        return response;
    }

    // ── Secteurs ──────────────────────────────────────────────────────────────

    @Transactional
    public Secteur ajouterSecteur(SecteurRequest request) {
        log.info("=== AJOUT SECTEUR ===");
        log.info("Requête reçue: {}", request);

        User user = getCurrentUser();

        if (user.getMunicipalite() == null) {
            log.error("ERREUR: L'utilisateur {} n'a pas de municipalité affectée", user.getEmail());
            throw new RuntimeException("Aucune municipalité affectée à votre compte. Contactez l'administrateur.");
        }

        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            log.error("ERREUR: Nom de secteur vide");
            throw new RuntimeException("Le nom du secteur est obligatoire");
        }

        String nomSecteur = request.getNom().trim();
        log.info("Nom du secteur à ajouter: '{}'", nomSecteur);

        boolean exists = secteurRepository.existsByNomAndMunicipaliteId(
                nomSecteur,
                user.getMunicipalite().getId()
        );

        if (exists) {
            log.error("ERREUR: Un secteur avec le nom '{}' existe déjà", nomSecteur);
            throw new RuntimeException("Un secteur avec ce nom existe déjà dans votre municipalité.");
        }

        Secteur secteur = new Secteur();
        secteur.setNom(nomSecteur);
        secteur.setMunicipalite(user.getMunicipalite());

        Secteur savedSecteur = secteurRepository.save(secteur);
        log.info("Secteur sauvegardé avec succès: ID={}, Nom={}",
                savedSecteur.getId(),
                savedSecteur.getNom()
        );

        return savedSecteur;
    }

    @Transactional
    public Secteur modifierSecteur(Long secteurId, SecteurRequest request) {
        log.info("=== MODIFICATION SECTEUR ===");
        log.info("ID Secteur: {}, Nouveau nom: {}", secteurId, request.getNom());

        Secteur secteur = validateSecteur(secteurId);

        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            throw new RuntimeException("Le nom du secteur est obligatoire");
        }

        String nouveauNom = request.getNom().trim();

        User user = getCurrentUser();
        boolean exists = secteurRepository.existsByNomAndMunicipaliteId(
                nouveauNom,
                user.getMunicipalite().getId()
        );

        if (exists && !secteur.getNom().equalsIgnoreCase(nouveauNom)) {
            throw new RuntimeException("Un secteur avec ce nom existe déjà dans votre municipalité.");
        }

        secteur.setNom(nouveauNom);
        Secteur savedSecteur = secteurRepository.save(secteur);
        log.info("Secteur modifié avec succès: {}", savedSecteur);

        return savedSecteur;
    }

    @Transactional
    public void supprimerSecteur(Long secteurId) {
        log.info("=== SUPPRESSION SECTEUR ===");
        log.info("ID Secteur à supprimer: {}", secteurId);

        try {
            Secteur secteur = validateSecteur(secteurId);
            log.info("Secteur trouvé: {} (ID: {})", secteur.getNom(), secteur.getId());

            long countRues = rueRepository.countBySecteurId(secteurId);
            log.info("Nombre de rues dans le secteur: {}", countRues);

            if (countRues > 0) {
                log.warn("Le secteur '{}' contient {} rues. Suppression impossible.",
                        secteur.getNom(), countRues);
                throw new RuntimeException("Impossible de supprimer ce secteur car il contient " + countRues + " rue(s). Supprimez d'abord les rues.");
            }

            secteurRepository.deleteById(secteurId);
            log.info("Secteur supprimé avec succès: {}", secteurId);

        } catch (Exception e) {
            log.error("Erreur lors de la suppression du secteur {}: {}", secteurId, e.getMessage(), e);
            throw e;
        }
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private Secteur validateSecteur(Long secteurId) {
        log.info("Validation du secteur ID: {}", secteurId);

        if (secteurId == null) {
            log.error("ID secteur null");
            throw new RuntimeException("ID du secteur invalide");
        }

        User user = getCurrentUser();
        log.info("Utilisateur: {}, Municipalité ID: {}", user.getEmail(),
                user.getMunicipalite() != null ? user.getMunicipalite().getId() : "null");

        if (user.getMunicipalite() == null) {
            log.error("L'utilisateur n'a pas de municipalité");
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        Secteur secteur = secteurRepository.findById(secteurId)
                .orElseThrow(() -> {
                    log.error("Secteur non trouvé avec ID: {}", secteurId);
                    return new RuntimeException("Secteur non trouvé");
                });

        log.info("Secteur trouvé: ID={}, Nom={}, Municipalité ID={}",
                secteur.getId(),
                secteur.getNom(),
                secteur.getMunicipalite().getId()
        );

        if (!secteur.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            log.error("Accès refusé: Le secteur {} n'appartient pas à la municipalité de l'utilisateur", secteurId);
            throw new RuntimeException("Accès refusé : ce secteur n'appartient pas à votre municipalité");
        }

        return secteur;
    }

    // ── Rues ──────────────────────────────────────────────────────────────────

    private Rue validateRue(Long rueId) {
        User user = getCurrentUser();
        Rue rue = rueRepository.findById(rueId)
                .orElseThrow(() -> new RuntimeException("Rue non trouvée"));
        if (!rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId()))
            throw new RuntimeException("Accès refusé : cette rue n'appartient pas à votre municipalité");
        return rue;
    }


    private Double calculerTaux(Integer nbCriteres) {
        if (nbCriteres == null || nbCriteres == 0) return 0.0;
        if (nbCriteres <= 2) return 0.08;
        if (nbCriteres <= 4) return 0.10;
        if (nbCriteres <= 6) return 0.12;
        return 0.14;
    }

    private EtatRoute convertToEtatRoute(String etatString) {
        if (etatString == null || etatString.isEmpty()) {
            return EtatRoute.BONNE;
        }
        try {
            return EtatRoute.valueOf(etatString.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("État de route invalide: {}, utilisation de la valeur par défaut", etatString);
            return EtatRoute.BONNE;
        }
    }

    // UserService.java - ajouterRue corrigé

    @Transactional
    public Rue ajouterRue(Long secteurId, RueRequest request) {
        log.info("=== AJOUT RUE ===");
        log.info("Données reçues: {}", request);
        log.info("eclairagePublic reçu: {}", request.getEclairagePublic());
        log.info("assainissement reçu: {}", request.getAssainissement());
        log.info("eauPotable reçu: {}", request.getEauPotable());
        log.info("electricite reçu: {}", request.getElectricite());
        log.info("voirie reçu: {}", request.getVoirie());
        log.info("proprete reçu: {}", request.getProprete());
        log.info("autreCritere reçu: {}", request.getAutreCritere());

        Secteur secteur = validateSecteur(secteurId);

        // ✅ Compter les critères cochés en vérifiant les valeurs booléennes
        Integer nbCriteres = compterCriteresCoches(request);
        Double taux = calculerTaux(nbCriteres);

        Rue rue = new Rue();
        rue.setNom(request.getNom());
        rue.setEtat(convertToEtatRoute(request.getEtat()));

        // ✅ IMPORTANT : Utiliser les valeurs du request, ou false si null
        // ✅ Le double négatif !! garantit un booléen
        rue.setEclairagePublic(request.getEclairagePublic() != null ? request.getEclairagePublic() : false);
        rue.setAssainissement(request.getAssainissement() != null ? request.getAssainissement() : false);
        rue.setEauPotable(request.getEauPotable() != null ? request.getEauPotable() : false);
        rue.setElectricite(request.getElectricite() != null ? request.getElectricite() : false);
        rue.setVoirie(request.getVoirie() != null ? request.getVoirie() : false);
        rue.setProprete(request.getProprete() != null ? request.getProprete() : false);
        rue.setAutreCritere(request.getAutreCritere() != null ? request.getAutreCritere() : false);

        rue.setAutreCritereDetails(request.getAutreCritereDetails());
        rue.setObservations(request.getObservations());
        rue.setPriorite(request.getPriorite() != null ? request.getPriorite() : 1);
        rue.setTaux(taux);
        rue.setNbCriteresCoches(nbCriteres);
        rue.setSecteur(secteur);

        Rue savedRue = rueRepository.save(rue);

        log.info("✅ Rue sauvegardée: {}", savedRue);
        log.info("   - eclairagePublic: {}", savedRue.getEclairagePublic());
        log.info("   - assainissement: {}", savedRue.getAssainissement());
        log.info("   - eauPotable: {}", savedRue.getEauPotable());
        log.info("   - electricite: {}", savedRue.getElectricite());
        log.info("   - voirie: {}", savedRue.getVoirie());
        log.info("   - proprete: {}", savedRue.getProprete());
        log.info("   - autreCritere: {}", savedRue.getAutreCritere());

        return savedRue;
    }

    // ✅ Correction de compterCriteresCoches avec des valeurs null-safe
    private Integer compterCriteresCoches(RueRequest request) {
        int count = 0;
        if (request.getEclairagePublic() != null && request.getEclairagePublic()) count++;
        if (request.getAssainissement() != null && request.getAssainissement()) count++;
        if (request.getEauPotable() != null && request.getEauPotable()) count++;
        if (request.getElectricite() != null && request.getElectricite()) count++;
        if (request.getVoirie() != null && request.getVoirie()) count++;
        if (request.getProprete() != null && request.getProprete()) count++;
        if (request.getAutreCritere() != null && request.getAutreCritere()) count++;
        return count;
    }

    @Transactional
    public Rue modifierRue(Long rueId, RueRequest request) {
        Rue rue = validateRue(rueId);

        Integer nbCriteres = compterCriteresCoches(request);
        Double taux = calculerTaux(nbCriteres);

        rue.setNom(request.getNom());
        rue.setEtat(convertToEtatRoute(request.getEtat()));
        rue.setEclairagePublic(request.getEclairagePublic() != null ? request.getEclairagePublic() : rue.getEclairagePublic());
        rue.setAssainissement(request.getAssainissement() != null ? request.getAssainissement() : rue.getAssainissement());
        rue.setEauPotable(request.getEauPotable() != null ? request.getEauPotable() : rue.getEauPotable());
        rue.setElectricite(request.getElectricite() != null ? request.getElectricite() : rue.getElectricite());
        rue.setVoirie(request.getVoirie() != null ? request.getVoirie() : rue.getVoirie());
        rue.setProprete(request.getProprete() != null ? request.getProprete() : rue.getProprete());
        rue.setAutreCritere(request.getAutreCritere() != null ? request.getAutreCritere() : rue.getAutreCritere());
        rue.setAutreCritereDetails(request.getAutreCritereDetails() != null ? request.getAutreCritereDetails() : rue.getAutreCritereDetails());
        rue.setObservations(request.getObservations() != null ? request.getObservations() : rue.getObservations());
        rue.setPriorite(request.getPriorite() != null ? request.getPriorite() : rue.getPriorite());
        rue.setTaux(taux);
        rue.setNbCriteresCoches(nbCriteres);

        return rueRepository.save(rue);
    }

    @Transactional
    public void supprimerRue(Long rueId) {
        validateRue(rueId);
        rueRepository.deleteById(rueId);
    }
}