// Paiement.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Un paiement (total ou partiel) enregistré contre une Recette pour une
 * année donnée. Chaque Paiement produit sa propre quittance (numeroQuittance).
 * Recette.montantPaye = somme des Paiement.montant pour cette recette.
 */
@Entity
@Table(name = "paiements", indexes = {
        @Index(name = "idx_paiement_recette", columnList = "recette_id")
})
@Data
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;

    @Column(name = "montant", nullable = false)
    private Double montant;

    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false, length = 20)
    private ModePaiement modePaiement;

    @Column(name = "numero_quittance", nullable = false, unique = true, length = 30)
    private String numeroQuittance;

    /** Nom de l'agent connecté ayant enregistré le paiement. */
    @Column(name = "agent_nom", length = 150)
    private String agentNom;

    @PrePersist
    protected void onCreate() {
        if (datePaiement == null) {
            datePaiement = LocalDateTime.now();
        }
    }
}
