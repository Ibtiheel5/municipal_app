package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ValeurVenaleTNBRequest {

    @NotNull(message = "La valeur vénale est obligatoire")
    @Positive(message = "La valeur vénale doit être positive")
    private Double valeurVn;

    @NotNull(message = "L'année est obligatoire")
    private Integer annee;

    private String description;
}
