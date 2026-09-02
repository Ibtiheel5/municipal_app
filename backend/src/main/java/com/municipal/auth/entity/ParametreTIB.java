package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Ligne de configuration unique (singleton) pour les paramètres globaux
 * du module TIB : frais administratifs, coefficient légal, délai de paiement.
 * Modifiable uniquement depuis la page Administration > Paramètres.
 */
@Data
@Entity
@Table(name = "parametre_tib")
public class ParametreTIB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "frais_administratifs", nullable = false)
    private Double fraisAdministratifs = 10.0;

    @Column(name = "coefficient_tib", nullable = false)
    private Double coefficientTIB = 0.02; // 2%

    @Column(name = "delai_paiement_jours", nullable = false)
    private Integer delaiPaiementJours = 30;

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
