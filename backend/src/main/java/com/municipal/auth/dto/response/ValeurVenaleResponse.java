// ValeurVenaleResponse.java - Version corrigée
package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class ValeurVenaleResponse {
    private Long id;
    private String zone;
    private Double valeurVenaleM2;  // ✅ Le nom doit être valeurVenaleM2
    private String description;
    private Boolean actif;
    private String municipaliteNom;

    // ✅ Getters et setters explicites (si Lombok ne fonctionne pas)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Double getValeurVenaleM2() { return valeurVenaleM2; }  // ✅ getValeurVenaleM2()
    public void setValeurVenaleM2(Double valeurVenaleM2) { this.valeurVenaleM2 = valeurVenaleM2; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public String getMunicipaliteNom() { return municipaliteNom; }
    public void setMunicipaliteNom(String municipaliteNom) { this.municipaliteNom = municipaliteNom; }
}