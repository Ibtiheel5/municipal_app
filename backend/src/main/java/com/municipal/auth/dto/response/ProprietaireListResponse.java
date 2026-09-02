// ProprietaireListResponse.java
package com.municipal.auth.dto.response;

public class ProprietaireListResponse {
    private Long id;
    private String cin;
    private String nom;
    private String prenom;
    private String telephone;
    private String adresse;
    private String typeBien;
    private Double superficie;
    private String rueNom;
    private String secteurNom;

    // Constructeurs
    public ProprietaireListResponse() {}

    public ProprietaireListResponse(Long id, String cin, String nom, String prenom, String telephone,
                                    String adresse, String typeBien, Double superficie,
                                    String rueNom, String secteurNom) {
        this.id = id;
        this.cin = cin;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.adresse = adresse;
        this.typeBien = typeBien;
        this.superficie = superficie;
        this.rueNom = rueNom;
        this.secteurNom = secteurNom;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getTypeBien() { return typeBien; }
    public void setTypeBien(String typeBien) { this.typeBien = typeBien; }

    public Double getSuperficie() { return superficie; }
    public void setSuperficie(Double superficie) { this.superficie = superficie; }

    public String getRueNom() { return rueNom; }
    public void setRueNom(String rueNom) { this.rueNom = rueNom; }

    public String getSecteurNom() { return secteurNom; }
    public void setSecteurNom(String secteurNom) { this.secteurNom = secteurNom; }
}