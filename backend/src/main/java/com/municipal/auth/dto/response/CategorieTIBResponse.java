// CategorieTIBResponse.java - Version corrigée
package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class CategorieTIBResponse {
    private Long id;
    private String code;
    private String libelle;
    private Double prixReferenceM2;
    private String description;  // ✅ Ajout du champ description
    private Integer ordreAffichage;  // ✅ Ajout du champ ordreAffichage
    private Boolean actif;

    // ✅ Getters et setters explicites
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public Double getPrixReferenceM2() { return prixReferenceM2; }
    public void setPrixReferenceM2(Double prixReferenceM2) { this.prixReferenceM2 = prixReferenceM2; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getOrdreAffichage() { return ordreAffichage; }
    public void setOrdreAffichage(Integer ordreAffichage) { this.ordreAffichage = ordreAffichage; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
}