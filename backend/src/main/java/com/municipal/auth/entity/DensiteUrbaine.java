// DensiteUrbaine.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Catégorie de densité urbaine utilisée pour la méthode 2 de calcul TNB.
 * Montant TNB = prixDensite × surface du terrain.
 * Gérée dynamiquement depuis la page Administration > Paramètres TNB.
 */
@Data
@Entity
@Table(name = "densite_urbaine")
public class DensiteUrbaine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String categorie; // Ex: "Densité élevée"

    @Column(name = "prix_densite", nullable = false)
    private Double prixDensite; // Ex: 0.385

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id")
    private Municipalite municipalite;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
