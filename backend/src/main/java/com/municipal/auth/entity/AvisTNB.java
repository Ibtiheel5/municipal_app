// AvisTNB.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Avis de paiement pour la Taxe sur les Terrains Non Bâtis (TNB).
 * Couvre les 4 sections du workflow :
 *  1. Informations administratives (codeTnb, sourceDossier, anneeFiscale, dates)
 *  2. Terrain concerné (terrain / propriétaire / rue)
 *  3. Calcul (méthode, valeur vénale OU densité, surface, montant)
 *  4. Avis (numeroAvis, dateAvis, dateLimite, statut)
 */
@Data
@Entity
@Table(name = "avis_tnb")
public class AvisTNB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── 1. Informations administratives ──────────────────────────
    @Column(name = "code_tnb", nullable = false, unique = true, length = 40)
    private String codeTnb;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_dossier", nullable = false, length = 20)
    private SourceDossier sourceDossier;

    @Column(name = "annee_fiscale", nullable = false)
    private Integer anneeFiscale;

    @Column(name = "date_creation", nullable = false)
    private LocalDate dateCreation = LocalDate.now();

    @Column(name = "date_debut_imposition", nullable = false)
    private LocalDate dateDebutImposition;

    // ── 2. Terrain / propriétaire / rue ──────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "terrain_id", nullable = false)
    private Terrain terrain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private Proprietaire proprietaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    // ── 3. Calcul (snapshot au moment de la génération) ─────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MethodeCalculTNB methode;

    /** Renseigné uniquement si méthode = VALEUR_VENALE */
    @Column(name = "valeur_venale")
    private Double valeurVenale;

    /** Renseigné uniquement si méthode = DENSITE */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "densite_id")
    private DensiteUrbaine densite;

    @Column(nullable = false)
    private Double surface;

    @Column(name = "montant_tnb", nullable = false)
    private Double montantTnb;

    // ── 4. Avis ────────────────────────────────────────────────
    @Column(name = "numero_avis", unique = true, length = 40)
    private String numeroAvis;

    @Column(name = "date_avis")
    private LocalDate dateAvis;

    @Column(name = "date_limite")
    private LocalDate dateLimite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "date_creation_enr")
    private LocalDateTime dateCreationEnr = LocalDateTime.now();
}
