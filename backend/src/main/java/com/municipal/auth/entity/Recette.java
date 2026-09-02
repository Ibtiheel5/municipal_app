// Recette.java (v3 — avec champ recetteNumber)
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "recettes", indexes = {
        @Index(name = "idx_recette_type", columnList = "type"),
        @Index(name = "idx_recette_statut", columnList = "statut"),
        @Index(name = "idx_recette_annee", columnList = "annee_fiscale"),
        @Index(name = "idx_recette_municipalite", columnList = "municipalite_id"),
        @Index(name = "idx_recette_bien", columnList = "bien_id")
})
@Data
public class Recette {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_recette", nullable = false, unique = true, length = 30)
    private String codeRecette;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TypeRecette type;

    @Column(name = "reference_taxe_id")
    private Long referenceTaxeId;

    @Column(name = "numero_avis", length = 40)
    private String numeroAvis;

    @Column(name = "code_taxe", length = 40)
    private String codeTaxe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private Proprietaire proprietaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id")
    private BienImmobilier bien;

    @Column(name = "municipalite_id", nullable = false)
    private Long municipaliteId;

    @Column(name = "date_debut_imposition")
    private LocalDate dateDebutImposition;

    @Column(name = "annee_fiscale", nullable = false)
    private Integer anneeFiscale;

    @Column(name = "montant", nullable = false)
    private Double montant;

    @Column(name = "montant_paye", nullable = false)
    private Double montantPaye = 0.0;

    @Column(name = "date_creation", nullable = false)
    private LocalDate dateCreation;

    @Column(name = "date_generation", nullable = false)
    private LocalDate dateGeneration;

    @Column(name = "date_limite")
    private LocalDate dateLimite;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 15)
    private StatutRecette statut;

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
        if (statut == null) {
            statut = StatutRecette.EN_ATTENTE;
        }
        if (montantPaye == null) {
            montantPaye = 0.0;
        }
    }
}