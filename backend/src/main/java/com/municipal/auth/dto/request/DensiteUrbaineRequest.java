package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class DensiteUrbaineRequest {

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    @NotNull(message = "Le prix densité est obligatoire")
    @Positive(message = "Le prix densité doit être positif")
    private Double prixDensite;

    private Boolean actif = true;
}
