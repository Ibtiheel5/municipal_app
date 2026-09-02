// RecetteService.java (v8 – cohérence des montants projetés)
package com.municipal.auth.service;

import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.PaiementRepository;
import com.municipal.auth.repository.RecetteRepository;
import com.municipal.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class RecetteService {

    private static final Logger log = LoggerFactory.getLogger(RecetteService.class);
    private static final double EPSILON = 0.001;

    private final RecetteRepository recetteRepository;
    private final PaiementRepository paiementRepository;
    private final UserRepository userRepository;

    public RecetteService(RecetteRepository recetteRepository,
                          PaiementRepository paiementRepository,
                          UserRepository userRepository) {
        this.recetteRepository = recetteRepository;
        this.paiementRepository = paiementRepository;
        this.userRepository = userRepository;
    }

    // ── Génération de codes avec timestamp + random ──
    private synchronized String generateCodeRecette() {
        String annee = String.valueOf(LocalDate.now().getYear());
        long timestamp = System.currentTimeMillis();
        int random = ThreadLocalRandom.current().nextInt(10000, 99999);
        return String.format("REC-%s-%d-%d", annee, timestamp, random);
    }

    private synchronized String generateNumeroQuittance() {
        long timestamp = System.currentTimeMillis();
        int random = ThreadLocalRandom.current().nextInt(10000, 99999);
        return String.format("QUIT-%d-%d", timestamp, random);
    }

    // ── Utilisateur courant ──
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ── Calcul du montant pour une année projetée ──
    private double getMontantProjete(Recette reference, BienImmobilier bien, TypeRecette type, Integer annee) {
        if (bien == null) {
            // Pour TNB, on utilise le montant de la référence elle-même
            return reference.getMontant();
        }
        List<Recette> reelles = recetteRepository.findByBienIdAndTypeOrderByAnneeFiscaleAsc(bien.getId(), type);
        List<Recette> avant = reelles.stream()
                .filter(r -> r.getAnneeFiscale() < annee)
                .collect(Collectors.toList());
        if (!avant.isEmpty()) {
            return avant.get(avant.size() - 1).getMontant();
        } else {
            return reference.getMontant();
        }
    }

    // ── Création automatique (TIB) ──
    @Transactional
    public Recette creerRecette(TypeRecette type, Long referenceTaxeId, String numeroAvis,
                                Proprietaire proprietaire, Rue rue, BienImmobilier bien,
                                LocalDate dateDebutImposition, Integer anneeFiscale,
                                Double montant, LocalDate dateGeneration, LocalDate dateLimite) {
        return creerRecette(type, referenceTaxeId, numeroAvis, null, proprietaire, rue, bien,
                dateDebutImposition, anneeFiscale, montant, dateGeneration, dateLimite);
    }

    @Transactional
    public Recette creerRecette(TypeRecette type, Long referenceTaxeId, String numeroAvis, String codeTaxe,
                                Proprietaire proprietaire, Rue rue, BienImmobilier bien,
                                LocalDate dateDebutImposition, Integer anneeFiscale,
                                Double montant, LocalDate dateGeneration, LocalDate dateLimite) {

        log.info("📝 Création recette TIB: type={}, annee={}, bienId={}", type, anneeFiscale, bien.getId());

        return recetteRepository.findByBienIdAndTypeAndAnneeFiscale(bien.getId(), type, anneeFiscale)
                .map(existante -> {
                    log.info("📝 Recette existante trouvée: id={}", existante.getId());
                    if (existante.getCodeTaxe() == null && codeTaxe != null) {
                        existante.setCodeTaxe(codeTaxe);
                        return recetteRepository.save(existante);
                    }
                    return existante;
                })
                .orElseGet(() -> {
                    log.info("📝 Création d'une nouvelle recette");
                    Recette recette = new Recette();
                    recette.setCodeRecette(generateCodeRecette());
                    recette.setType(type);
                    recette.setReferenceTaxeId(referenceTaxeId);
                    recette.setNumeroAvis(numeroAvis);
                    recette.setCodeTaxe(codeTaxe);
                    recette.setProprietaire(proprietaire);
                    recette.setRue(rue);
                    recette.setBien(bien);
                    recette.setMunicipaliteId(rue.getSecteur().getMunicipalite().getId());
                    recette.setDateDebutImposition(dateDebutImposition);
                    recette.setAnneeFiscale(anneeFiscale);
                    recette.setMontant(montant);
                    recette.setMontantPaye(0.0);
                    recette.setDateGeneration(dateGeneration != null ? dateGeneration : LocalDate.now());
                    recette.setDateLimite(dateLimite);
                    recette.setStatut(StatutRecette.EN_ATTENTE);
                    return recetteRepository.save(recette);
                });
    }

    // ── Création automatique (TNB) ──
    @Transactional
    public Recette creerRecette(TypeRecette type, Long referenceTaxeId, String numeroAvis,
                                Proprietaire proprietaire, Rue rue,
                                Integer anneeFiscale, Double montant,
                                LocalDate dateGeneration, LocalDate dateLimite) {
        return creerRecette(type, referenceTaxeId, numeroAvis, null, proprietaire, rue,
                anneeFiscale, montant, dateGeneration, dateLimite);
    }

    @Transactional
    public Recette creerRecette(TypeRecette type, Long referenceTaxeId, String numeroAvis, String codeTaxe,
                                Proprietaire proprietaire, Rue rue,
                                Integer anneeFiscale, Double montant,
                                LocalDate dateGeneration, LocalDate dateLimite) {

        log.info("📝 Création recette TNB: type={}, annee={}, refTaxeId={}", type, anneeFiscale, referenceTaxeId);

        return recetteRepository.findAll().stream()
                .filter(r -> r.getType() == type && referenceTaxeId.equals(r.getReferenceTaxeId()))
                .findFirst()
                .map(existante -> {
                    log.info("📝 Recette TNB existante trouvée: id={}", existante.getId());
                    if (existante.getCodeTaxe() == null && codeTaxe != null) {
                        existante.setCodeTaxe(codeTaxe);
                        return recetteRepository.save(existante);
                    }
                    return existante;
                })
                .orElseGet(() -> {
                    log.info("📝 Création d'une nouvelle recette TNB");
                    Recette recette = new Recette();
                    recette.setCodeRecette(generateCodeRecette());
                    recette.setType(type);
                    recette.setReferenceTaxeId(referenceTaxeId);
                    recette.setNumeroAvis(numeroAvis);
                    recette.setCodeTaxe(codeTaxe);
                    recette.setProprietaire(proprietaire);
                    recette.setRue(rue);
                    recette.setBien(null);
                    recette.setMunicipaliteId(rue.getSecteur().getMunicipalite().getId());
                    recette.setDateDebutImposition(null);
                    recette.setAnneeFiscale(anneeFiscale);
                    recette.setMontant(montant);
                    recette.setMontantPaye(0.0);
                    recette.setDateGeneration(dateGeneration != null ? dateGeneration : LocalDate.now());
                    recette.setDateLimite(dateLimite);
                    recette.setStatut(StatutRecette.EN_ATTENTE);
                    return recetteRepository.save(recette);
                });
    }

    // ── Relevé de compte ──
    public ReleveCompteResponse getReleveCompte(String code) {
        log.info("📊 Récupération du relevé pour le code: {}", code);

        Recette reference = recetteRepository.findFirstByCodeRecetteOrNumeroAvisOrCodeTaxe(code, code, code)
                .orElseThrow(() -> {
                    log.error("❌ Aucun dossier trouvé pour le code: {}", code);
                    return new RuntimeException("Aucun dossier trouvé pour le code \"" + code + "\"");
                });

        BienImmobilier bien = reference.getBien();
        TypeRecette type = reference.getType();

        List<Recette> reelles;
        if (bien != null) {
            reelles = recetteRepository.findByBienIdAndTypeOrderByAnneeFiscaleAsc(bien.getId(), type);
        } else {
            reelles = recetteRepository.findAll().stream()
                    .filter(r -> r.getType() == type && reference.getReferenceTaxeId().equals(r.getReferenceTaxeId()))
                    .collect(Collectors.toList());
        }

        Map<Integer, Recette> parAnnee = reelles.stream()
                .collect(Collectors.toMap(Recette::getAnneeFiscale, r -> r, (a, b) -> a));

        LocalDate debut = reference.getDateDebutImposition();
        int anneeDebut = debut != null ? debut.getYear()
                : reelles.stream().map(Recette::getAnneeFiscale).min(Integer::compareTo).orElse(LocalDate.now().getYear());
        int anneeFin = LocalDate.now().getYear();

        // Dernier montant connu (utilisé pour les années projetées)
        double dernierMontantConnu = reference.getMontant();
        // On va mettre à jour ce dernierMontantConnu au fur et à mesure des années réelles
        List<AnneeReleveResponse> annees = new ArrayList<>();
        double totalDu = 0, totalPaye = 0, totalRestant = 0;

        for (int annee = anneeDebut; annee <= anneeFin; annee++) {
            Recette r = parAnnee.get(annee);
            AnneeReleveResponse row = new AnneeReleveResponse();
            row.setAnnee(annee);

            if (r != null) {
                // Recette réelle
                dernierMontantConnu = r.getMontant();
                double reste = Math.max(0, r.getMontant() - r.getMontantPaye());
                row.setRecetteId(r.getId());
                row.setMontantDu(r.getMontant());
                row.setMontantPaye(r.getMontantPaye());
                row.setMontantRestant(reste);
                row.setStatut(calculerStatut(r.getMontant(), r.getMontantPaye(), annee, anneeFin));
                row.setQuittanceDisponible(r.getMontantPaye() > EPSILON);
                row.setProjection(false);
            } else {
                // Année projetée : utiliser le montant calculé par getMontantProjete
                double montantProjete = getMontantProjete(reference, bien, type, annee);
                row.setRecetteId(null);
                row.setMontantDu(montantProjete);
                row.setMontantPaye(0.0);
                row.setMontantRestant(montantProjete);
                row.setStatut(annee < anneeFin ? StatutRecette.EN_RETARD : StatutRecette.EN_ATTENTE);
                row.setQuittanceDisponible(false);
                row.setProjection(true);
            }
            row.setStatutLabel(row.getStatut().getLabel());

            totalDu += row.getMontantDu();
            totalPaye += row.getMontantPaye();
            totalRestant += row.getMontantRestant();
            annees.add(row);
        }

        ReleveCompteResponse response = new ReleveCompteResponse();
        response.setCodeRecherche(code);
        response.setType(type);
        response.setTypeLabel(type.getLabel());
        if (bien != null) {
            response.setBienId(bien.getId());
            response.setBienAdresse(bien.getAdresse());
            response.setBienTypeBien(bien.getTypeBien());
        }
        response.setProprietaireId(reference.getProprietaire().getId());
        response.setProprietaireNom(reference.getProprietaire().getNom() + " " + reference.getProprietaire().getPrenom());
        response.setProprietaireCin(reference.getProprietaire().getCin());
        response.setProprietaireAdresse(reference.getProprietaire().getAdresse());
        response.setRueNom(reference.getRue().getNom());
        response.setSecteurNom(reference.getRue().getSecteur().getNom());
        response.setMunicipaliteNom(reference.getRue().getSecteur().getMunicipalite().getNom());
        response.setAnneeDebutImposition(anneeDebut);
        response.setAnnees(annees);
        response.setTotalDu(totalDu);
        response.setTotalPaye(totalPaye);
        response.setTotalRestant(totalRestant);

        log.info("📊 Relevé généré: totalDu={}, totalPaye={}, totalRestant={}", totalDu, totalPaye, totalRestant);
        return response;
    }

    private StatutRecette calculerStatut(double montant, double montantPaye, int annee, int anneeCourante) {
        if (montantPaye >= montant - EPSILON) return StatutRecette.PAYE;
        if (montantPaye > EPSILON) return StatutRecette.PARTIEL;
        return annee < anneeCourante ? StatutRecette.EN_RETARD : StatutRecette.EN_ATTENTE;
    }

    // ── Enregistrer un paiement ──
    @Transactional
    public AnneeReleveResponse enregistrerPaiementAnnee(String code, Integer annee, Double montant, ModePaiement modePaiement) {
        log.info("💰 Enregistrement paiement: code={}, annee={}, montant={}, mode={}",
                code, annee, montant, modePaiement);

        if (montant == null || montant <= 0) {
            log.error("❌ Montant invalide: {}", montant);
            throw new RuntimeException("Le montant du paiement doit être positif");
        }

        Recette reference = recetteRepository.findFirstByCodeRecetteOrNumeroAvisOrCodeTaxe(code, code, code)
                .orElseThrow(() -> {
                    log.error("❌ Aucun dossier trouvé pour le code: {}", code);
                    return new RuntimeException("Aucun dossier trouvé pour le code \"" + code + "\"");
                });

        BienImmobilier bien = reference.getBien();
        TypeRecette type = reference.getType();

        Recette recette;
        if (bien != null) {
            recette = recetteRepository.findByBienIdAndTypeAndAnneeFiscale(bien.getId(), type, annee)
                    .orElseGet(() -> {
                        log.info("💰 Création d'une recette projetée pour TIB année {}", annee);
                        return creerRecetteProjetee(reference, bien, type, annee);
                    });
        } else {
            recette = recetteRepository.findAll().stream()
                    .filter(r -> r.getType() == type &&
                            r.getAnneeFiscale().equals(annee) &&
                            reference.getReferenceTaxeId().equals(r.getReferenceTaxeId()))
                    .findFirst()
                    .orElseGet(() -> {
                        log.info("💰 Création d'une recette projetée pour TNB année {}", annee);
                        return creerRecetteProjeteeTNB(reference, type, annee);
                    });
        }

        double reste = recette.getMontant() - recette.getMontantPaye();
        log.info("💰 Reste à payer pour l'année {}: {}", annee, reste);

        if (reste < EPSILON) {
            log.error("❌ Année {} déjà entièrement payée (reste={})", annee, reste);
            throw new RuntimeException("Cette année (" + annee + ") est déjà entièrement payée.");
        }

        if (montant > reste + EPSILON) {
            log.error("❌ Montant {} dépasse le reste à payer {}", montant, reste);
            throw new RuntimeException(String.format(
                    "Le montant (%.3f TND) dépasse le reste à payer (%.3f TND)", montant, reste));
        }

        Paiement paiement = enregistrerPaiementSurRecette(recette, montant, modePaiement);

        double resteApres = Math.max(0, recette.getMontant() - recette.getMontantPaye());
        AnneeReleveResponse row = new AnneeReleveResponse();
        row.setAnnee(annee);
        row.setRecetteId(recette.getId());
        row.setMontantDu(recette.getMontant());
        row.setMontantPaye(recette.getMontantPaye());
        row.setMontantRestant(resteApres);
        row.setStatut(calculerStatut(recette.getMontant(), recette.getMontantPaye(), annee, LocalDate.now().getYear()));
        row.setStatutLabel(row.getStatut().getLabel());
        row.setQuittanceDisponible(true);
        row.setProjection(false);

        log.info("✅ Paiement enregistré avec succès pour l'année {}, quittance: {}", annee, paiement.getNumeroQuittance());
        return row;
    }

    // ── Création de recette projetée ──
    private Recette creerRecetteProjetee(Recette reference, BienImmobilier bien, TypeRecette type, Integer annee) {
        double montant = getMontantProjete(reference, bien, type, annee);
        Recette recette = new Recette();
        recette.setCodeRecette(generateCodeRecette());
        recette.setType(type);
        recette.setReferenceTaxeId(reference.getReferenceTaxeId());
        recette.setNumeroAvis(reference.getNumeroAvis());
        recette.setCodeTaxe(reference.getCodeTaxe());
        recette.setProprietaire(reference.getProprietaire());
        recette.setRue(reference.getRue());
        recette.setBien(bien);
        recette.setMunicipaliteId(reference.getMunicipaliteId());
        recette.setDateDebutImposition(reference.getDateDebutImposition());
        recette.setAnneeFiscale(annee);
        recette.setMontant(montant);
        recette.setMontantPaye(0.0);
        recette.setDateGeneration(LocalDate.now());
        recette.setDateLimite(LocalDate.now().plusDays(30));
        recette.setStatut(StatutRecette.EN_ATTENTE);
        return recetteRepository.save(recette);
    }

    private Recette creerRecetteProjeteeTNB(Recette reference, TypeRecette type, Integer annee) {
        // Pour TNB, on utilise le montant de la référence elle-même (car pas de bien pour calculer l'historique)
        double montant = reference.getMontant();
        Recette recette = new Recette();
        recette.setCodeRecette(generateCodeRecette());
        recette.setType(type);
        recette.setReferenceTaxeId(reference.getReferenceTaxeId());
        recette.setNumeroAvis(reference.getNumeroAvis());
        recette.setCodeTaxe(reference.getCodeTaxe());
        recette.setProprietaire(reference.getProprietaire());
        recette.setRue(reference.getRue());
        recette.setBien(null);
        recette.setMunicipaliteId(reference.getMunicipaliteId());
        recette.setDateDebutImposition(null);
        recette.setAnneeFiscale(annee);
        recette.setMontant(montant);
        recette.setMontantPaye(0.0);
        recette.setDateGeneration(LocalDate.now());
        recette.setDateLimite(LocalDate.now().plusDays(30));
        recette.setStatut(StatutRecette.EN_ATTENTE);
        return recetteRepository.save(recette);
    }

    // ── Marquer comme payé par référence ──
    @Transactional
    public void marquerPayeParReferenceTaxe(TypeRecette type, Long referenceTaxeId, ModePaiement modePaiement) {
        log.info("💰 Marquer comme payé: type={}, refTaxeId={}", type, referenceTaxeId);
        recetteRepository.findAll().stream()
                .filter(r -> r.getType() == type && referenceTaxeId.equals(r.getReferenceTaxeId()))
                .findFirst()
                .ifPresent(recette -> {
                    double reste = recette.getMontant() - recette.getMontantPaye();
                    if (reste > EPSILON) {
                        enregistrerPaiementSurRecette(recette, reste, modePaiement);
                    }
                });
    }

    // ── Enregistrement d'un paiement sur une recette ──
    private Paiement enregistrerPaiementSurRecette(Recette recette, Double montant, ModePaiement modePaiement) {
        User agent = getCurrentUser();
        Paiement paiement = new Paiement();
        paiement.setRecette(recette);
        paiement.setMontant(montant);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setModePaiement(modePaiement != null ? modePaiement : ModePaiement.ESPECES);
        paiement.setNumeroQuittance(generateNumeroQuittance());
        paiement.setAgentNom(agent.getNom());
        paiement = paiementRepository.save(paiement);

        recette.setMontantPaye(recette.getMontantPaye() + montant);
        recette.setStatut(recette.getMontantPaye() >= recette.getMontant() - EPSILON
                ? StatutRecette.PAYE : StatutRecette.PARTIEL);
        recetteRepository.save(recette);

        return paiement;
    }

    // ── Quittances ──
    public List<PaiementResponse> getQuittancesByRecette(Long recetteId) {
        return paiementRepository.findByRecetteIdOrderByDatePaiementDesc(recetteId).stream()
                .map(this::mapToPaiementResponse)
                .collect(Collectors.toList());
    }

    public QuittanceResponse getQuittance(String numeroQuittance) {
        Paiement paiement = paiementRepository.findByNumeroQuittance(numeroQuittance)
                .orElseThrow(() -> new RuntimeException("Quittance non trouvée"));
        Recette recette = paiement.getRecette();
        QuittanceResponse dto = new QuittanceResponse();
        dto.setNumeroQuittance(paiement.getNumeroQuittance());
        dto.setCodeRecette(recette.getCodeRecette());
        dto.setTypeLabel(recette.getType().getLabel());
        dto.setProprietaireNom(recette.getProprietaire().getNom() + " " + recette.getProprietaire().getPrenom());
        dto.setProprietaireCin(recette.getProprietaire().getCin());
        dto.setProprietaireAdresse(recette.getProprietaire().getAdresse());
        dto.setRueNom(recette.getRue().getNom());
        dto.setSecteurNom(recette.getRue().getSecteur().getNom());
        dto.setMunicipaliteNom(recette.getRue().getSecteur().getMunicipalite().getNom());
        dto.setAnneeFiscale(recette.getAnneeFiscale());
        dto.setMontant(paiement.getMontant());
        dto.setDatePaiement(paiement.getDatePaiement());
        dto.setModePaiement(paiement.getModePaiement());
        dto.setModePaiementLabel(paiement.getModePaiement().getLabel());
        dto.setAgentNom(paiement.getAgentNom());
        return dto;
    }

    // ── Toutes les recettes ──
    public Page<RecetteResponse> rechercherRecettes(TypeRecette type, Integer annee, StatutRecette statut,
                                                    String secteurNom, String search,
                                                    int page, int size, String sortBy, String sortDir) {
        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }
        Long municipaliteId = user.getMunicipalite().getId();

        Specification<Recette> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("municipaliteId"), municipaliteId));
            if (type != null) predicates.add(cb.equal(root.get("type"), type));
            if (annee != null) predicates.add(cb.equal(root.get("anneeFiscale"), annee));
            if (statut != null) predicates.add(cb.equal(root.get("statut"), statut));
            if (secteurNom != null && !secteurNom.isBlank())
                predicates.add(cb.equal(root.get("rue").get("secteur").get("nom"), secteurNom));
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("codeRecette")), like),
                        cb.like(cb.lower(root.get("proprietaire").get("nom")), like),
                        cb.like(cb.lower(root.get("proprietaire").get("prenom")), like),
                        cb.like(cb.lower(root.get("proprietaire").get("cin")), like)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        String sortField = mapSortField(sortBy);
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC, sortField);
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 20 : size, sort);
        return recetteRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    private String mapSortField(String sortBy) {
        if (sortBy == null) return "dateGeneration";
        return switch (sortBy) {
            case "montant" -> "montant";
            case "nom" -> "proprietaire.nom";
            case "annee" -> "anneeFiscale";
            default -> "dateGeneration";
        };
    }

    public RecetteResponse getRecetteById(Long id) {
        Recette recette = recetteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));
        return mapToResponse(recette);
    }

    @Transactional
    public RecetteResponse marquerPaye(Long id, ModePaiement modePaiement) {
        Recette recette = recetteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));
        double reste = recette.getMontant() - recette.getMontantPaye();
        if (reste < EPSILON) {
            throw new RuntimeException("Cette recette est déjà entièrement payée.");
        }
        enregistrerPaiementSurRecette(recette, reste, modePaiement);
        return mapToResponse(recette);
    }

    // ── Mapping ──
    private PaiementResponse mapToPaiementResponse(Paiement p) {
        PaiementResponse dto = new PaiementResponse();
        dto.setId(p.getId());
        dto.setMontant(p.getMontant());
        dto.setDatePaiement(p.getDatePaiement());
        dto.setModePaiement(p.getModePaiement());
        dto.setModePaiementLabel(p.getModePaiement().getLabel());
        dto.setNumeroQuittance(p.getNumeroQuittance());
        dto.setAgentNom(p.getAgentNom());
        return dto;
    }

    private RecetteResponse mapToResponse(Recette r) {
        RecetteResponse dto = new RecetteResponse();
        dto.setId(r.getId());
        dto.setCodeRecette(r.getCodeRecette());
        dto.setType(r.getType());
        dto.setTypeLabel(r.getType().getLabel());
        dto.setReferenceTaxeId(r.getReferenceTaxeId());
        dto.setNumeroAvis(r.getNumeroAvis());
        dto.setProprietaireId(r.getProprietaire().getId());
        dto.setProprietaireNom(r.getProprietaire().getNom() + " " + r.getProprietaire().getPrenom());
        dto.setProprietaireCin(r.getProprietaire().getCin());
        dto.setRueId(r.getRue().getId());
        dto.setRueNom(r.getRue().getNom());
        dto.setSecteurNom(r.getRue().getSecteur().getNom());
        dto.setMunicipaliteNom(r.getRue().getSecteur().getMunicipalite().getNom());
        dto.setMunicipaliteId(r.getMunicipaliteId());
        dto.setAnneeFiscale(r.getAnneeFiscale());
        dto.setMontant(r.getMontant());
        dto.setMontantPaye(r.getMontantPaye());
        dto.setMontantRestant(Math.max(0, r.getMontant() - r.getMontantPaye()));
        dto.setDateCreation(r.getDateCreation());
        dto.setDateGeneration(r.getDateGeneration());
        dto.setDateLimite(r.getDateLimite());
        StatutRecette statutEffectif = calculerStatut(r.getMontant(), r.getMontantPaye(), r.getAnneeFiscale(), LocalDate.now().getYear());
        if (statutEffectif != r.getStatut()) {
            r.setStatut(statutEffectif);
            recetteRepository.save(r);
        }
        dto.setStatut(statutEffectif);
        dto.setStatutLabel(statutEffectif.getLabel());
        dto.setEstEnRetard(statutEffectif == StatutRecette.EN_RETARD);
        paiementRepository.findByRecetteIdOrderByDatePaiementDesc(r.getId()).stream()
                .findFirst()
                .ifPresent(dernier -> {
                    dto.setDatePaiement(dernier.getDatePaiement());
                    dto.setModePaiement(dernier.getModePaiement());
                    dto.setModePaiementLabel(dernier.getModePaiement().getLabel());
                });
        return dto;
    }
}