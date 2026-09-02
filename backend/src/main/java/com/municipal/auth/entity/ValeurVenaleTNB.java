// ValeurVenaleTNB.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Référentiel administratif des valeurs vénales (catalogue consultable/gérable
 * par l'administrateur). La valeur réellement utilisée pour un calcul d'avis
 * TNB "Méthode 1" peut être saisie librement lors de la génération, ou
 * reprise depuis ce référentiel.
 */
@Data
@Entity
@Table(name = "valeur_venale_tnb")
public class ValeurVenaleTNB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "valeur_vn", nullable = false)
    private Double valeurVn;

    @Column(nullable = false)
    private Integer annee;

    @Column(length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id")
    private Municipalite municipalite;

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
