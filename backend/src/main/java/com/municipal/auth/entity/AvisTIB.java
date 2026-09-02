// AvisTIB.java - Version corrigée avec ValeurVenale
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Remplace l'usage de AvisPaiement pour le module TIB.
 * Couvre les 4 sections du workflow :
 *  1. Informations administratives (codeTib, sourceDossier, anneeFiscale, dates)
 *  2. Bien immobilier concerné (bien / proprietaire / rue)
 *  3. Calcul (categorie, prixReference, surface, taux, coefficient, montants)
 *  4. Avis (numeroAvis, dateAvis, dateLimite, statut)
 */
@Data
@Entity
@Table(name = "avis_tib")
public class AvisTIB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── 1. Informations administratives ──────────────────────────
    @Column(name = "code_tib", nullable = false, unique = true, length = 40)
    private String codeTib;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_dossier", nullable = false, length = 20)
    private SourceDossier sourceDossier;

    @Column(name = "annee_fiscale", nullable = false)
    private Integer anneeFiscale;

    @Column(name = "date_creation", nullable = false)
    private LocalDate dateCreation = LocalDate.now();

    @Column(name = "date_debut_imposition", nullable = false)
    private LocalDate dateDebutImposition;

    // ── 2. Bien / propriétaire / rue ─────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id", nullable = false)
    private BienImmobilier bien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private Proprietaire proprietaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    // ── 3. Calcul (snapshot au moment de la génération) ─────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private CategorieTIB categorie;

    @Column(name = "prix_reference_m2", nullable = false)
    private Double prixReferenceM2;

    @Column(nullable = false)
    private Double surface;

    @Column(name = "taux_rue", nullable = false)
    private Double tauxRue;

    @Column(nullable = false)
    private Double coefficient = 0.02;

    @Column(name = "montant_tib", nullable = false)
    private Double montantTib;

    @Column(name = "frais_administratifs", nullable = false)
    private Double fraisAdministratifs;

    @Column(name = "taxe_totale", nullable = false)
    private Double taxeTotale;

    // ✅ AJOUT : Relation avec ValeurVenale
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "valeur_venale_id")
    private ValeurVenale valeurVenale;

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