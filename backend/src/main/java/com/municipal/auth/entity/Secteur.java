package com.municipal.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "secteurs")
public class Secteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id", nullable = false)
    @JsonIgnore  // ✅ Important
    private Municipalite municipalite;

    @OneToMany(mappedBy = "secteur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // ✅ Important
    private List<Rue> rues;

    // Constructeurs
    public Secteur() {}

    public Secteur(Long id, String nom, Municipalite municipalite, List<Rue> rues) {
        this.id = id;
        this.nom = nom;
        this.municipalite = municipalite;
        this.rues = rues;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Municipalite getMunicipalite() { return municipalite; }
    public void setMunicipalite(Municipalite municipalite) { this.municipalite = municipalite; }

    public List<Rue> getRues() { return rues; }
    public void setRues(List<Rue> rues) { this.rues = rues; }
}