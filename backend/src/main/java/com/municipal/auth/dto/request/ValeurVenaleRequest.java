// ValeurVenaleRequest.java - Version corrigée
package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ValeurVenaleRequest {

    @NotBlank(message = "La zone est obligatoire")
    private String zone;

    @NotNull(message = "La valeur vénale est obligatoire")
    @Positive(message = "La valeur vénale doit être positive")
    private Double valeurVenaleM2;  // ✅ Le nom doit être valeurVenaleM2

    private String description;

    private Boolean actif = true;

    // ✅ Getters et setters explicites (si Lombok ne fonctionne pas)
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Double getValeurVenaleM2() { return valeurVenaleM2; }  // ✅ getValeurVenaleM2() (pas getValeurM2())
    public void setValeurVenaleM2(Double valeurVenaleM2) { this.valeurVenaleM2 = valeurVenaleM2; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
}