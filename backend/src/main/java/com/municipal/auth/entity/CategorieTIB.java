// CategorieTIB.java - Version corrigée
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "categorie_tib")
public class CategorieTIB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(name = "prix_reference_m2", nullable = false)
    private Double prixReferenceM2;

    @Column(length = 500)
    private String description;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage = 0;

    @Column(nullable = false)
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id", nullable = true)
    private Municipalite municipalite;  // optionnel : catégories globales par défaut

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PreUpdate
    public void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}