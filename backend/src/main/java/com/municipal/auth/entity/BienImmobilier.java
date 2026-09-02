// BienImmobilier.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "biens_immobiliers")
public class BienImmobilier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private Double superficie;

    @Column(nullable = false)
    private String typeBien;

    // ✅ Le nom exact de la colonne est 'tauxtib'
    @Column(name = "tauxtib", nullable = false)
    private Double tauxTIB;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private Proprietaire proprietaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    @OneToMany(mappedBy = "bien", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AvisPaiement> avis = new ArrayList<>();

    public BienImmobilier() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public Double getSuperficie() { return superficie; }
    public void setSuperficie(Double superficie) { this.superficie = superficie; }

    public String getTypeBien() { return typeBien; }
    public void setTypeBien(String typeBien) { this.typeBien = typeBien; }

    public Double getTauxTIB() { return tauxTIB; }
    public void setTauxTIB(Double tauxTIB) { this.tauxTIB = tauxTIB; }

    public Proprietaire getProprietaire() { return proprietaire; }
    public void setProprietaire(Proprietaire proprietaire) { this.proprietaire = proprietaire; }

    public Rue getRue() { return rue; }
    public void setRue(Rue rue) { this.rue = rue; }

    public List<AvisPaiement> getAvis() { return avis; }
    public void setAvis(List<AvisPaiement> avis) { this.avis = avis; }
}