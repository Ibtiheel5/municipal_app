// CategorieTIBRequest.java - Version corrigée
package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CategorieTIBRequest {

    @NotBlank(message = "Le code est obligatoire")
    private String code;

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    @NotNull(message = "Le prix de référence est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double prixReferenceM2;

    private String description;  // ✅ Ajout du champ description

    private Integer ordreAffichage = 0;  // ✅ Ajout du champ ordreAffichage

    private Boolean actif = true;

    // ✅ Getters et setters explicites
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