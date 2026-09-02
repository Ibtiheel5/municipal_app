package com.municipal.auth.dto.request;

import com.municipal.auth.entity.SourceTIB;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AvisTIBRequest {

    @NotNull(message = "L'ID du bien est obligatoire")
    private Long bienId;

    @NotNull(message = "L'année fiscale est obligatoire")
    private Integer anneeFiscale;

    @NotNull(message = "La catégorie TIB est obligatoire")
    private Long categorieTIBId;

    private Long valeurVenaleId;

    @NotNull(message = "La superficie est obligatoire")
    @Positive(message = "La superficie doit être positive")
    private Double surface;

    @NotNull(message = "La source est obligatoire")
    private SourceTIB source;

    private String observations;
}