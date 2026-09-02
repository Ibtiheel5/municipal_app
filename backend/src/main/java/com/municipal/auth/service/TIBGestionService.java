// TIBGestionService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.CalculTIBRequest;
import com.municipal.auth.dto.request.GenererAvisTIBRequest;
import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TIBGestionService {

    private final UserRepository userRepository;
    private final RueRepository rueRepository;
    private final ProprietaireRepository proprietaireRepository;
    private final BienImmobilierRepository bienImmobilierRepository;
    private final CategorieTIBRepository categorieTIBRepository;
    private final AvisTIBRepository avisTIBRepository;
    private final PaiementRepository paiementRepository;
    private final AdminTIBService adminTIBService;
    // ✅ AJOUT : gestion des recettes financières (Dashboard Recettes)
    private final RecetteService recetteService;

    public TIBGestionService(UserRepository userRepository, RueRepository rueRepository,
                             ProprietaireRepository proprietaireRepository,
                             BienImmobilierRepository bienImmobilierRepository,
                             CategorieTIBRepository categorieTIBRepository,
                             AvisTIBRepository avisTIBRepository,
                             PaiementRepository paiementRepository,
                             AdminTIBService adminTIBService,
                             RecetteService recetteService) { // ✅ AJOUT
        this.userRepository = userRepository;
        this.rueRepository = rueRepository;
        this.proprietaireRepository = proprietaireRepository;
        this.bienImmobilierRepository = bienImmobilierRepository;
        this.categorieTIBRepository = categorieTIBRepository;
        this.avisTIBRepository = avisTIBRepository;
        this.paiementRepository = paiementRepository;
        this.adminTIBService = adminTIBService;
        this.recetteService = recetteService; // ✅ AJOUT
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ── Section 2 : Rues / Propriétaires / Biens ────────────────────────────

    public List<RueInfoResponse> getRues() {
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }
        return user.getMunicipalite().getSecteurs().stream()
                .flatMap(s -> s.getRues().stream())
                .map(rue -> {
                    RueInfoResponse response = new RueInfoResponse();
                    response.setId(rue.getId());
                    response.setNom(rue.getNom());
                    response.setSecteurNom(rue.getSecteur().getNom());
                    response.setTaux(rue.getTaux());
                    response.setNbProprietaires((int) proprietaireRepository.countByRueId(rue.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    public List<ProprietaireResponse> getProprietairesByRue(Long rueId) {
        User user = getCurrentUser();
        Rue rue = rueRepository.findById(rueId)
                .orElseThrow(() -> new RuntimeException("Rue non trouvée"));

        verifierAccesRue(rue, user);

        return proprietaireRepository.findByRueId(rueId).stream()
                .map(this::mapToProprietaireResponse)
                .collect(Collectors.toList());
    }

    public List<ProprietaireResponse> rechercherProprietaires(String cin, String nom) {
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

        return proprietaires.stream()
                .map(this::mapToProprietaireResponse)
                .collect(Collectors.toList());
    }

    public ProprietaireResponse getProprietaireDetails(Long proprietaireId) {
        Proprietaire proprietaire = proprietaireRepository.findById(proprietaireId)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));
        return mapToProprietaireResponse(proprietaire);
    }

    public BienImmobilierResponse getBienDetails(Long bienId) {
        BienImmobilier bien = bienImmobilierRepository.findById(bienId)
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));
        return mapToBienResponse(bien);
    }

    // ── Section 3 : Catégories + calcul temps réel ──────────────────────────

    public List<CategorieTIBResponse> getCategoriesActives() {
        return categorieTIBRepository.findByActifTrueOrderByLibelleAsc().stream()
                .map(c -> {
                    CategorieTIBResponse r = new CategorieTIBResponse();
                    r.setId(c.getId());
                    r.setCode(c.getCode());
                    r.setLibelle(c.getLibelle());
                    r.setPrixReferenceM2(c.getPrixReferenceM2());
                    r.setActif(c.getActif());
                    return r;
                })
                .collect(Collectors.toList());
    }

    /**
     * Calcul en temps réel (section 3), sans persistance.
     * Montant TIB = Prix de référence × Surface × Coefficient × Taux de la rue
     * Taxe totale = Montant TIB + Frais administratifs
     */
    public CalculTIBResponse simulerCalcul(CalculTIBRequest request) {
        BienImmobilier bien = bienImmobilierRepository.findById(request.getBienId())
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));
        CategorieTIB categorie = categorieTIBRepository.findById(request.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Catégorie TIB non trouvée"));

        double surface = (request.getSurface() != null && request.getSurface() > 0)
                ? request.getSurface() : bien.getSuperficie();
        double tauxRue = bien.getRue().getTaux();
        ParametreTIB parametre = adminTIBService.getOrCreateParametre();
        double coefficient = parametre.getCoefficientTIB();
        double frais = (request.getFraisAdministratifs() != null)
                ? request.getFraisAdministratifs() : parametre.getFraisAdministratifs();

        double montantTib = arrondir(categorie.getPrixReferenceM2() * surface * coefficient * tauxRue);
        double taxeTotale = arrondir(montantTib + frais);

        CalculTIBResponse response = new CalculTIBResponse();
        response.setCategorieId(categorie.getId());
        response.setCategorieLibelle(categorie.getLibelle());
        response.setPrixReferenceM2(categorie.getPrixReferenceM2());
        response.setSurface(surface);
        response.setTauxRue(tauxRue);
        response.setCoefficient(coefficient);
        response.setMontantTib(montantTib);
        response.setFraisAdministratifs(frais);
        response.setTaxeTotale(taxeTotale);
        response.setFormule("Montant TIB = Prix référence × Surface × " + (int) (coefficient * 100)
                + "% × Taux rue  |  Taxe totale = Montant TIB + Frais administratifs");
        return response;
    }

    // ── Section 1 + 4 : Génération de l'avis ────────────────────────────────

    @Transactional
    public AvisTIBResponse genererAvis(GenererAvisTIBRequest request) {
        BienImmobilier bien = bienImmobilierRepository.findById(request.getBienId())
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));
        CategorieTIB categorie = categorieTIBRepository.findById(request.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Catégorie TIB non trouvée"));

        if (request.getSourceDossier() == null) {
            throw new RuntimeException("La source du dossier est obligatoire.");
        }
        if (request.getAnneeFiscale() == null) {
            throw new RuntimeException("L'année fiscale est obligatoire.");
        }
        if (request.getDateDebutImposition() == null) {
            throw new RuntimeException("La date de début d'imposition est obligatoire.");
        }

        double surface = (request.getSurface() != null && request.getSurface() > 0)
                ? request.getSurface() : bien.getSuperficie();
        double tauxRue = bien.getRue().getTaux();
        ParametreTIB parametre = adminTIBService.getOrCreateParametre();
        double coefficient = parametre.getCoefficientTIB();
        double frais = (request.getFraisAdministratifs() != null)
                ? request.getFraisAdministratifs() : parametre.getFraisAdministratifs();

        double montantTib = arrondir(categorie.getPrixReferenceM2() * surface * coefficient * tauxRue);
        double taxeTotale = arrondir(montantTib + frais);

        LocalDate dateAvis = LocalDate.now();
        LocalDate dateLimite = dateAvis.plusDays(parametre.getDelaiPaiementJours());

        AvisTIB avis = new AvisTIB();
        avis.setCodeTib(genererCodeTib(request.getAnneeFiscale()));
        avis.setSourceDossier(request.getSourceDossier());
        avis.setAnneeFiscale(request.getAnneeFiscale());
        avis.setDateCreation(LocalDate.now());
        avis.setDateDebutImposition(request.getDateDebutImposition());

        avis.setBien(bien);
        avis.setProprietaire(bien.getProprietaire());
        avis.setRue(bien.getRue());

        avis.setCategorie(categorie);
        avis.setPrixReferenceM2(categorie.getPrixReferenceM2());
        avis.setSurface(surface);
        avis.setTauxRue(tauxRue);
        avis.setCoefficient(coefficient);
        avis.setMontantTib(montantTib);
        avis.setFraisAdministratifs(frais);
        avis.setTaxeTotale(taxeTotale);

        avis.setNumeroAvis(genererNumeroAvis());
        avis.setDateAvis(dateAvis);
        avis.setDateLimite(dateLimite);
        avis.setStatut(StatutPaiement.EN_ATTENTE);
        avis.setObservations(request.getObservations());

        avis = avisTIBRepository.save(avis);

        // ✅ AJOUT : création automatique de la recette correspondante (idempotent)
        recetteService.creerRecette(
                TypeRecette.TIB,
                avis.getId(),
                avis.getNumeroAvis(),
                avis.getCodeTib(),                 // ✅ ajouté : permet la recherche par Code TIB
                avis.getProprietaire(),
                avis.getRue(),
                bien,                              // ✅ ajouté
                avis.getDateDebutImposition(),     // ✅ ajouté
                avis.getAnneeFiscale(),
                avis.getTaxeTotale(),
                avis.getDateAvis(),
                avis.getDateLimite()
        );
        return mapToAvisResponse(avis);
    }

    public List<AvisTIBResponse> getAvisByProprietaire(Long proprietaireId) {
        return avisTIBRepository.findByProprietaireIdOrderByDateCreationEnrDesc(proprietaireId)
                .stream()
                .map(this::mapToAvisResponse)
                .collect(Collectors.toList());
    }

    /** Historique + recherche / filtres (section 4) : année, rue, propriétaire, statut. */
    public List<AvisTIBResponse> rechercherHistorique(Integer annee, Long rueId, Long proprietaireId, StatutPaiement statut) {
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }
        return avisTIBRepository
                .rechercher(user.getMunicipalite().getId(), annee, rueId, proprietaireId, statut)
                .stream()
                .map(this::mapToAvisResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AvisTIBResponse marquerPaye(Long avisId, String modePaiement, String reference) {
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));

        if (avis.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Cet avis est déjà marqué comme payé.");
        }

        avis.setStatut(StatutPaiement.PAYE);
        avis = avisTIBRepository.save(avis);

        // ✅ synchronise (ou crée) le paiement côté Recette — plus de Paiement lié à l'avis directement
        recetteService.marquerPayeParReferenceTaxe(
                TypeRecette.TIB,
                avis.getId(),
                convertirModePaiement(modePaiement)
        );

        return mapToAvisResponse(avis);
    }
    public AvisTIBResponse getAvisDetails(Long avisId) {
        AvisTIB avis = avisTIBRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé"));
        return mapToAvisResponse(avis);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void verifierAccesRue(Rue rue, User user) {
        if (user.getMunicipalite() == null
                || !rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }
    }

    private double arrondir(double valeur) {
        return Math.round(valeur * 1000.0) / 1000.0;
    }

    private String genererCodeTib(int anneeFiscale) {
        long count = avisTIBRepository.count() + 1;
        return String.format("TIB-%d-%05d", anneeFiscale, count);
    }

    private String genererNumeroAvis() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = avisTIBRepository.count() + 1;
        return String.format("AVIS-TIB-%s-%05d", date, count);
    }

    // ✅ AJOUT : conversion sécurisée de la chaîne "mode de paiement" reçue du
    // frontend vers l'enum ModePaiement utilisé par les recettes.
    private ModePaiement convertirModePaiement(String mode) {
        if (mode == null) return ModePaiement.ESPECES;
        try {
            return ModePaiement.valueOf(mode.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ModePaiement.ESPECES;
        }
    }

    private ProprietaireResponse mapToProprietaireResponse(Proprietaire proprietaire) {
        ProprietaireResponse response = new ProprietaireResponse();
        response.setId(proprietaire.getId());
        response.setCin(proprietaire.getCin());
        response.setNom(proprietaire.getNom());
        response.setPrenom(proprietaire.getPrenom());
        response.setDateNaissance(proprietaire.getDateNaissance());
        response.setTelephone(proprietaire.getTelephone());
        response.setEmail(proprietaire.getEmail());
        response.setAdresse(proprietaire.getAdresse());
        response.setNumeroBien(proprietaire.getNumeroBien());
        response.setSuperficie(proprietaire.getSuperficie());
        response.setTypeBien(proprietaire.getTypeBien());
        response.setObservations(proprietaire.getObservations());
        response.setRueId(proprietaire.getRue().getId());
        response.setRueNom(proprietaire.getRue().getNom());
        response.setSecteurNom(proprietaire.getRue().getSecteur().getNom());
        response.setMunicipaliteNom(proprietaire.getRue().getSecteur().getMunicipalite().getNom());
        response.setTauxTIB(proprietaire.getRue().getTaux());

        if (proprietaire.getBiens() != null) {
            response.setNbBiens(proprietaire.getBiens().size());
            response.setBiens(proprietaire.getBiens().stream()
                    .map(this::mapToBienResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setNbBiens(0);
            response.setBiens(null);
        }
        return response;
    }

    private BienImmobilierResponse mapToBienResponse(BienImmobilier bien) {
        BienImmobilierResponse response = new BienImmobilierResponse();
        response.setId(bien.getId());
        response.setAdresse(bien.getAdresse());
        response.setSuperficie(bien.getSuperficie());
        response.setTypeBien(bien.getTypeBien());
        response.setTauxTIB(bien.getTauxTIB());
        response.setRueNom(bien.getRue().getNom());
        response.setSecteurNom(bien.getRue().getSecteur().getNom());
        return response;
    }

    private AvisTIBResponse mapToAvisResponse(AvisTIB avis) {
        AvisTIBResponse response = new AvisTIBResponse();
        response.setId(avis.getId());

        response.setCodeTib(avis.getCodeTib());
        response.setSourceDossier(avis.getSourceDossier());
        response.setSourceDossierLabel(avis.getSourceDossier().getLabel());
        response.setAnneeFiscale(avis.getAnneeFiscale());
        response.setDateCreation(avis.getDateCreation());
        response.setDateDebutImposition(avis.getDateDebutImposition());

        response.setBienId(avis.getBien().getId());
        response.setBienAdresse(avis.getBien().getAdresse());
        response.setTypeBien(avis.getBien().getTypeBien());
        response.setProprietaireId(avis.getProprietaire().getId());
        response.setProprietaireNom(avis.getProprietaire().getNom() + " " + avis.getProprietaire().getPrenom());
        response.setProprietaireCin(avis.getProprietaire().getCin());
        response.setRueId(avis.getRue().getId());
        response.setRueNom(avis.getRue().getNom());
        response.setSecteurNom(avis.getRue().getSecteur().getNom());
        response.setMunicipaliteNom(avis.getRue().getSecteur().getMunicipalite().getNom());

        response.setCategorieLibelle(avis.getCategorie().getLibelle());
        response.setPrixReferenceM2(avis.getPrixReferenceM2());
        response.setSurface(avis.getSurface());
        response.setTauxRue(avis.getTauxRue());
        response.setCoefficient(avis.getCoefficient());
        response.setMontantTib(avis.getMontantTib());
        response.setFraisAdministratifs(avis.getFraisAdministratifs());
        response.setTaxeTotale(avis.getTaxeTotale());

        response.setNumeroAvis(avis.getNumeroAvis());
        response.setDateAvis(avis.getDateAvis());
        response.setDateLimite(avis.getDateLimite());
        response.setObservations(avis.getObservations());

        StatutPaiement statutCourant = avis.getStatut();
        if (statutCourant == StatutPaiement.EN_ATTENTE && avis.getDateLimite() != null) {
            long joursRestants = LocalDate.now().until(avis.getDateLimite()).getDays();
            response.setJoursRestants(joursRestants);
            response.setEstEnRetard(joursRestants < 0);
            if (joursRestants < 0) {
                avis.setStatut(StatutPaiement.EN_RETARD);
                avisTIBRepository.save(avis);
                statutCourant = StatutPaiement.EN_RETARD;
            }
        } else if (statutCourant == StatutPaiement.PAYE) {
            response.setJoursRestants(null);
            response.setEstEnRetard(false);
        } else {
            response.setJoursRestants(null);
            response.setEstEnRetard(true);
        }
        response.setStatut(statutCourant);
        response.setStatutLabel(statutCourant.getLabel());

        return response;
    }
}