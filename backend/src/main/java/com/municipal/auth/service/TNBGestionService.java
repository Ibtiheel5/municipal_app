// TNBGestionService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.GenererAvisTNBRequest;
import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.municipal.auth.dto.request.TerrainRequest;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service principal du module TNB (Taxe sur les Terrains Non Bâtis).
 * Couvre les 4 sections du workflow : informations administratives,
 * terrain concerné, calcul (valeur vénale OU densité urbaine), avis + historique.
 *
 * Règles métier :
 *  - Méthode 1 (Valeur Vénale) : Montant TNB = (VN × 3) / 1000
 *  - Méthode 2 (Densité)       : Montant TNB = Prix densité × Surface du terrain
 *  - Date limite = Date avis + délai (30 jours par défaut)
 *
 * ✅ CORRECTIF : la génération d'un avis TNB ne créait jamais la Recette
 *    correspondante (contrairement au module TIB, voir TIBGestionService),
 *    donc les avis TNB n'apparaissaient jamais dans le Dashboard Recettes.
 *    On injecte RecetteService et on crée la recette juste après la
 *    sauvegarde de l'avis, et on synchronise son statut lors du paiement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TNBGestionService {

    private static final int DELAI_PAIEMENT_JOURS = 30;

    private final UserRepository userRepository;
    private final ProprietaireRepository proprietaireRepository;
    private final TerrainRepository terrainRepository;
    private final DensiteUrbaineRepository densiteUrbaineRepository;
    private final AvisTNBRepository avisTNBRepository;
    // ✅ AJOUT : gestion des recettes financières (Dashboard Recettes)
    private final RecetteService recetteService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ── Référentiel densités (lecture, section 3) ───────────────────────────

    public List<DensiteUrbaineResponse> getDensitesActives() {
        return densiteUrbaineRepository.findByActifTrueOrderByPrixDensiteDesc().stream()
                .map(d -> {
                    DensiteUrbaineResponse r = new DensiteUrbaineResponse();
                    r.setId(d.getId());
                    r.setCategorie(d.getCategorie());
                    r.setPrixDensite(d.getPrixDensite());
                    r.setActif(d.getActif());
                    return r;
                })
                .collect(Collectors.toList());
    }

    // ── Section 2 : recherche / sélection propriétaire + terrains ──────────

    public List<ProprietaireTNBResponse> rechercherProprietaires(String cin, String nom) {
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }
        Long municipaliteId = user.getMunicipalite().getId();
        List<Proprietaire> proprietaires;
        if (cin != null && !cin.isEmpty()) {
            proprietaires = proprietaireRepository.findByCinContainingAndMunicipaliteId(cin, municipaliteId);
        } else if (nom != null && !nom.isEmpty()) {
            proprietaires = proprietaireRepository.findByNomContainingAndMunicipaliteId(nom, municipaliteId);
        } else {
            proprietaires = proprietaireRepository.findByMunicipaliteId(municipaliteId);
        }
        return proprietaires.stream().map(this::mapProprietaireLight).collect(Collectors.toList());
    }

    public ProprietaireTNBResponse getProprietaireDetails(Long proprietaireId) {
        Proprietaire proprietaire = proprietaireRepository.findById(proprietaireId)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));
        return mapProprietaireAvecTerrains(proprietaire);
    }

    // ── Section 3 : calcul (effectué également côté client en temps réel) ──

    /** Calcule le montant TNB selon la méthode 1 (valeur vénale). */
    public double calculerParValeurVenale(double valeurVenale) {
        return arrondir((valeurVenale * 3) / 1000.0);
    }

    /** Calcule le montant TNB selon la méthode 2 (densité urbaine). */
    public double calculerParDensite(double prixDensite, double surface) {
        return arrondir(prixDensite * surface);
    }

    // ── Section 1 + 3 + 4 : génération de l'avis ────────────────────────────

    @Transactional
    public AvisTNBResponse genererAvis(GenererAvisTNBRequest request) {
        if (request.getTerrainId() == null) {
            throw new RuntimeException("Le terrain est obligatoire");
        }
        if (request.getSourceDossier() == null) {
            throw new RuntimeException("La source du dossier est obligatoire");
        }
        if (request.getAnneeFiscale() == null) {
            throw new RuntimeException("L'année fiscale est obligatoire");
        }
        if (request.getDateDebutImposition() == null) {
            throw new RuntimeException("La date de début d'imposition est obligatoire");
        }
        if (request.getMethode() == null) {
            throw new RuntimeException("La méthode de calcul est obligatoire");
        }

        Terrain terrain = terrainRepository.findById(request.getTerrainId())
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé"));

        double surface = (request.getSurface() != null && request.getSurface() > 0)
                ? request.getSurface() : terrain.getSurface();

        double montantTnb;
        DensiteUrbaine densite = null;
        Double valeurVenale = null;

        if (request.getMethode() == MethodeCalculTNB.VALEUR_VENALE) {
            if (request.getValeurVenale() == null || request.getValeurVenale() <= 0) {
                throw new RuntimeException("La valeur vénale doit être positive");
            }
            valeurVenale = request.getValeurVenale();
            montantTnb = calculerParValeurVenale(valeurVenale);
        } else {
            if (request.getDensiteId() == null) {
                throw new RuntimeException("La catégorie de densité est obligatoire");
            }
            densite = densiteUrbaineRepository.findById(request.getDensiteId())
                    .orElseThrow(() -> new RuntimeException("Catégorie de densité non trouvée"));
            montantTnb = calculerParDensite(densite.getPrixDensite(), surface);
        }

        LocalDate dateAvis = LocalDate.now();
        LocalDate dateLimite = dateAvis.plusDays(DELAI_PAIEMENT_JOURS);

        AvisTNB avis = new AvisTNB();
        avis.setCodeTnb(genererCodeTnb(request.getAnneeFiscale()));
        avis.setSourceDossier(request.getSourceDossier());
        avis.setAnneeFiscale(request.getAnneeFiscale());
        avis.setDateCreation(LocalDate.now());
        avis.setDateDebutImposition(request.getDateDebutImposition());

        avis.setTerrain(terrain);
        avis.setProprietaire(terrain.getProprietaire());
        avis.setRue(terrain.getRue());

        avis.setMethode(request.getMethode());
        avis.setValeurVenale(valeurVenale);
        avis.setDensite(densite);
        avis.setSurface(surface);
        avis.setMontantTnb(montantTnb);

        avis.setNumeroAvis(genererNumeroAvis());
        avis.setDateAvis(dateAvis);
        avis.setDateLimite(dateLimite);
        avis.setStatut(StatutPaiement.EN_ATTENTE);
        avis.setObservations(request.getObservations());

        avis = avisTNBRepository.save(avis);
        log.info("✅ Avis TNB généré: {}", avis.getNumeroAvis());

        // ✅ AJOUT : création automatique de la recette correspondante (idempotent),
        // exactement comme pour TIB dans TIBGestionService.genererAvis().
        // Sans cet appel, l'avis TNB n'apparaît jamais dans le Dashboard Recettes.
        recetteService.creerRecette(
                TypeRecette.TNB,
                avis.getId(),
                avis.getNumeroAvis(),
                avis.getCodeTnb(),                 // ✅ ajouté : permet la recherche par Code TNB
                avis.getProprietaire(),
                avis.getRue(),
                avis.getAnneeFiscale(),
                avis.getMontantTnb(),
                avis.getDateAvis(),
                avis.getDateLimite()
        );

        return mapToAvisResponse(avis);
    }

    @Transactional
    public TerrainResponse ajouterTerrain(Long proprietaireId, TerrainRequest request) {
        Proprietaire proprietaire = proprietaireRepository.findById(proprietaireId)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));

        if (request.getReference() == null || request.getReference().trim().isEmpty()) {
            throw new RuntimeException("La référence du terrain est obligatoire");
        }
        if (request.getSurface() == null || request.getSurface() <= 0) {
            throw new RuntimeException("La surface doit être positive");
        }

        Terrain terrain = new Terrain();
        terrain.setReference(request.getReference().trim());
        terrain.setSurface(request.getSurface());
        terrain.setProprietaire(proprietaire);
        terrain.setRue(proprietaire.getRue()); // le terrain hérite de la rue du propriétaire

        if (request.getDensiteId() != null) {
            densiteUrbaineRepository.findById(request.getDensiteId())
                    .ifPresent(terrain::setDensite);
        }

        terrain = terrainRepository.save(terrain);
        log.info("✅ Terrain TNB créé: ID={}, propriétaire={}", terrain.getId(), proprietaireId);
        return mapTerrain(terrain);
    }



    public List<AvisTNBResponse> getAvisByProprietaire(Long proprietaireId) {
        return avisTNBRepository.findByProprietaireIdOrderByDateCreationEnrDesc(proprietaireId)
                .stream()
                .map(this::mapToAvisResponse)
                .collect(Collectors.toList());
    }

    /** Historique + recherche / filtres (section 4). */
    public List<AvisTNBResponse> rechercherHistorique(Integer annee, StatutPaiement statut,
                                                      MethodeCalculTNB methode, String search) {
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }
        return avisTNBRepository
                .rechercher(user.getMunicipalite().getId(), annee, statut, methode, search)
                .stream()
                .map(this::mapToAvisResponse)
                .collect(Collectors.toList());
    }

    public AvisTNBResponse getAvisDetails(Long avisId) {
        AvisTNB avis = avisTNBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));
        return mapToAvisResponse(avis);
    }

    @Transactional
    public AvisTNBResponse marquerPaye(Long avisId) {
        AvisTNB avis = avisTNBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));
        if (avis.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Cet avis est déjà marqué comme payé.");
        }
        avis.setStatut(StatutPaiement.PAYE);
        avis = avisTNBRepository.save(avis);

        // ✅ AJOUT : synchroniser le statut de la recette liée à cet avis TNB.
        // Sans cela, l'avis passe à "Payé" mais la recette reste "En attente"
        // dans le Dashboard Recettes.
        recetteService.marquerPayeParReferenceTaxe(
                TypeRecette.TNB,
                avis.getId(),
                ModePaiement.ESPECES
        );

        return mapToAvisResponse(avis);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private double arrondir(double valeur) {
        return Math.round(valeur * 1000.0) / 1000.0;
    }

    private String genererCodeTnb(int anneeFiscale) {
        long count = avisTNBRepository.count() + 1;
        return String.format("TNB-%d-%05d", anneeFiscale, count);
    }

    private String genererNumeroAvis() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = avisTNBRepository.count() + 1;
        return String.format("AVIS-TNB-%s-%05d", date, count);
    }

    private ProprietaireTNBResponse mapProprietaireLight(Proprietaire p) {
        ProprietaireTNBResponse r = new ProprietaireTNBResponse();
        r.setId(p.getId());
        r.setCin(p.getCin());
        r.setNom(p.getNom());
        r.setPrenom(p.getPrenom());
        r.setTelephone(p.getTelephone());
        r.setAdresse(p.getAdresse());
        if (p.getRue() != null) {
            r.setRueNom(p.getRue().getNom());
            if (p.getRue().getSecteur() != null) {
                r.setSecteurNom(p.getRue().getSecteur().getNom());
                if (p.getRue().getSecteur().getMunicipalite() != null) {
                    r.setMunicipaliteNom(p.getRue().getSecteur().getMunicipalite().getNom());
                }
            }
        }
        return r;
    }

    private ProprietaireTNBResponse mapProprietaireAvecTerrains(Proprietaire p) {
        ProprietaireTNBResponse r = mapProprietaireLight(p);
        List<Terrain> terrains = terrainRepository.findByProprietaireId(p.getId());
        r.setTerrains(terrains.stream().map(this::mapTerrain).collect(Collectors.toList()));
        return r;
    }

    private TerrainResponse mapTerrain(Terrain t) {
        TerrainResponse r = new TerrainResponse();
        r.setId(t.getId());
        r.setReference(t.getReference());
        r.setAdresse(t.getReference());
        r.setSurface(t.getSurface());
        if (t.getDensite() != null) {
            r.setDensiteId(t.getDensite().getId());
            r.setDensiteCategorie(t.getDensite().getCategorie());
        }
        if (t.getRue() != null) {
            r.setRueId(t.getRue().getId());
            r.setRueNom(t.getRue().getNom());
        }
        return r;
    }

    private AvisTNBResponse mapToAvisResponse(AvisTNB avis) {
        AvisTNBResponse r = new AvisTNBResponse();
        r.setId(avis.getId());

        r.setCodeTnb(avis.getCodeTnb());
        r.setSourceDossier(avis.getSourceDossier());
        r.setSourceDossierLabel(avis.getSourceDossier() != null ? avis.getSourceDossier().getLabel() : null);
        r.setAnneeFiscale(avis.getAnneeFiscale());
        r.setDateCreation(avis.getDateCreation());
        r.setDateDebutImposition(avis.getDateDebutImposition());

        if (avis.getTerrain() != null) {
            r.setTerrainId(avis.getTerrain().getId());
            r.setTerrainAdresse(avis.getTerrain().getReference());
        }
        if (avis.getProprietaire() != null) {
            r.setProprietaireId(avis.getProprietaire().getId());
            r.setProprietaireNom(avis.getProprietaire().getNom() + " " + avis.getProprietaire().getPrenom());
            r.setProprietaireCin(avis.getProprietaire().getCin());
        }
        if (avis.getRue() != null) {
            r.setRueId(avis.getRue().getId());
            r.setRueNom(avis.getRue().getNom());
            if (avis.getRue().getSecteur() != null) {
                r.setSecteurNom(avis.getRue().getSecteur().getNom());
                if (avis.getRue().getSecteur().getMunicipalite() != null) {
                    r.setMunicipaliteNom(avis.getRue().getSecteur().getMunicipalite().getNom());
                }
            }
        }

        r.setMethode(avis.getMethode());
        r.setMethodeLabel(avis.getMethode() != null ? avis.getMethode().getLabel() : null);
        r.setValeurVenale(avis.getValeurVenale());
        if (avis.getDensite() != null) {
            r.setDensiteId(avis.getDensite().getId());
            r.setDensiteCategorie(avis.getDensite().getCategorie());
            r.setPrixDensite(avis.getDensite().getPrixDensite());
        }
        r.setSurface(avis.getSurface());
        r.setMontantTnb(avis.getMontantTnb());

        r.setNumeroAvis(avis.getNumeroAvis());
        r.setDateAvis(avis.getDateAvis());
        r.setDateLimite(avis.getDateLimite());
        r.setObservations(avis.getObservations());

        StatutPaiement statutCourant = avis.getStatut();
        if (statutCourant == StatutPaiement.EN_ATTENTE && avis.getDateLimite() != null) {
            long joursRestants = LocalDate.now().until(avis.getDateLimite()).getDays();
            r.setJoursRestants(joursRestants);
            r.setEstEnRetard(joursRestants < 0);
            if (joursRestants < 0) {
                avis.setStatut(StatutPaiement.EN_RETARD);
                avisTNBRepository.save(avis);
                statutCourant = StatutPaiement.EN_RETARD;
            }
        } else if (statutCourant == StatutPaiement.PAYE) {
            r.setJoursRestants(null);
            r.setEstEnRetard(false);
        } else {
            r.setJoursRestants(null);
            r.setEstEnRetard(true);
        }
        r.setStatut(statutCourant);
        r.setStatutLabel(statutCourant.getLabel());

        return r;
    }
}