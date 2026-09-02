// ValeurVenale.java - Version corrigée
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "valeur_venale")
public class ValeurVenale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String zone;

    @Column(name = "valeur_venale_m2", nullable = false)
    private Double valeurVenaleM2;

    @Column(length = 500)
    private String description;

    @Column(name = "actif")
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id", nullable = true)
    private Municipalite municipalite; // optionnel : valeur vénale globale par défaut

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}