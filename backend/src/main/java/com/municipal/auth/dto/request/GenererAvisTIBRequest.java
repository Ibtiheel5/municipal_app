package com.municipal.auth.dto.request;

import com.municipal.auth.entity.SourceDossier;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GenererAvisTIBRequest {

    // Section 1 - informations administratives
    private SourceDossier sourceDossier;
    private Integer anneeFiscale;
    private LocalDate dateDebutImposition;

    // Section 2 - bien concerné
    private Long bienId;

    // Section 3 - calcul
    private Long categorieId;
    private Double surface;
    private Double fraisAdministratifs; // optionnel, sinon paramètre global

    private String observations;
}
