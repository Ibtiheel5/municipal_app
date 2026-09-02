// ProprietaireResponse.java
package com.municipal.auth.dto.response;

import java.time.LocalDate;
import java.util.List;

public class ProprietaireResponse {
    private Long id;
    private String cin;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String telephone;
    private String email;
    private String adresse;
    private String numeroBien;
    private Double superficie;
    private String typeBien;
    private String observations;
    private Long rueId;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;
    private Double tauxTIB;
    private Integer nbBiens;
    private List<BienImmobilierResponse> biens;

    public ProprietaireResponse() {}

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

    public Long getRueId() { return rueId; }
    public void setRueId(Long rueId) { this.rueId = rueId; }

    public String getRueNom() { return rueNom; }
    public void setRueNom(String rueNom) { this.rueNom = rueNom; }

    public String getSecteurNom() { return secteurNom; }
    public void setSecteurNom(String secteurNom) { this.secteurNom = secteurNom; }

    public String getMunicipaliteNom() { return municipaliteNom; }
    public void setMunicipaliteNom(String municipaliteNom) { this.municipaliteNom = municipaliteNom; }

    public Double getTauxTIB() { return tauxTIB; }
    public void setTauxTIB(Double tauxTIB) { this.tauxTIB = tauxTIB; }

    public Integer getNbBiens() { return nbBiens; }
    public void setNbBiens(Integer nbBiens) { this.nbBiens = nbBiens; }

    public List<BienImmobilierResponse> getBiens() { return biens; }
    public void setBiens(List<BienImmobilierResponse> biens) { this.biens = biens; }
}