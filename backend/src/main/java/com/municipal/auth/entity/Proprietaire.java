// Proprietaire.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "proprietaires")
public class Proprietaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String cin;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private LocalDate dateNaissance;

    @Column(length = 20)
    private String telephone;

    @Column
    private String email;

    @Column(nullable = false)
    private String adresse;

    @Column
    private String numeroBien;

    @Column(nullable = false)
    private Double superficie;

    @Column(nullable = false)
    private String typeBien;

    @Column(length = 500)
    private String observations;

    @ManyToOne
    @JoinColumn(name = "rue_id", nullable = false)
    private Rue rue;

    @OneToMany(mappedBy = "proprietaire", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<BienImmobilier> biens = new ArrayList<>();

    @OneToMany(mappedBy = "proprietaire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AvisPaiement> avis = new ArrayList<>();

    public Proprietaire() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getNumeroBien() { return numeroBien; }
    public void setNumeroBien(String numeroBien) { this.numeroBien = numeroBien; }

    public Double getSuperficie() { return superficie; }
    public void setSuperficie(Double superficie) { this.superficie = superficie; }

    public String getTypeBien() { return typeBien; }
    public void setTypeBien(String typeBien) { this.typeBien = typeBien; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public Rue getRue() { return rue; }
    public void setRue(Rue rue) { this.rue = rue; }

    public List<BienImmobilier> getBiens() { return biens; }
    public void setBiens(List<BienImmobilier> biens) { this.biens = biens; }

    public List<AvisPaiement> getAvis() { return avis; }
    public void setAvis(List<AvisPaiement> avis) { this.avis = avis; }
}