// BienImmobilierResponse.java
package com.municipal.auth.dto.response;

public class BienImmobilierResponse {
    private Long id;
    private String adresse;
    private Double superficie;
    private String typeBien;
    private Double tauxTIB;
    private String rueNom;
    private String secteurNom;

    public BienImmobilierResponse() {}

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

    public String getRueNom() { return rueNom; }
    public void setRueNom(String rueNom) { this.rueNom = rueNom; }

    public String getSecteurNom() { return secteurNom; }
    public void setSecteurNom(String secteurNom) { this.secteurNom = secteurNom; }
}