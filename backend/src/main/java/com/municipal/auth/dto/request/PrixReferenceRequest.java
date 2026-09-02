// PrixReferenceRequest.java
package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PrixReferenceRequest {

    @NotNull(message = "L'année fiscale est obligatoire")
    private Integer anneeFiscale;

    @NotNull(message = "Le type de bien est obligatoire")
    private String typeBien;

    @NotNull(message = "Le prix au m² est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double prixM2;
}