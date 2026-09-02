package com.municipal.auth.dto.request;

import com.municipal.auth.entity.MethodeCalculTNB;
import com.municipal.auth.entity.SourceDossier;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GenererAvisTNBRequest {

    // Section 1 - informations administratives
    private SourceDossier sourceDossier;
    private Integer anneeFiscale;
    private LocalDate dateDebutImposition;

    // Section 2 - terrain concerné
    private Long terrainId;

    // Section 3 - calcul
    private MethodeCalculTNB methode;
    private Double valeurVenale;   // requis si methode = VALEUR_VENALE
    private Long densiteId;        // requis si methode = DENSITE
    private Double surface;        // optionnel, sinon on prend terrain.surface

    private String observations;
}
