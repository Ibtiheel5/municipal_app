// Terrain.java
package com.municipal.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

/**
 * Terrain non bâti rattaché à un propriétaire, utilisé par le module TNB.
 * Distinct de BienImmobilier (qui concerne les biens bâtis / TIB).
 */
@Data
@Entity
@Table(name = "terrains")
public class Terrain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Référence ou adresse du terrain (ex: "Lot 12, Zone industrielle") */
    @Column(nullable = false)
    private String reference;

    @Column(nullable = false)
    private Double surface;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    @JsonIgnore
    private Proprietaire proprietaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    /** Densité urbaine par défaut pré-associée au terrain (facultatif, pré-sélection à l'écran) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "densite_id")
    private DensiteUrbaine densite;

    @OneToMany(mappedBy = "terrain", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AvisTNB> avis;
}
