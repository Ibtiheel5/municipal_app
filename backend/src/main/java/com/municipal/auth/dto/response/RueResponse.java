package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class RueResponse {
    private Long id;
    private String nom;
    private Double prixReferenceM2;
    private Double taux;
    private Double tauxBase;
    private String etat;
    private Boolean eclairagePublic;
    private Boolean assainissement;
    private Boolean eauPotable;
    private Boolean electricite;
    private Boolean voirie;
    private Boolean proprete;
    private Boolean autreCritere;
    private String autreCritereDetails;
    private String observations;
    private Integer priorite;
    private Integer nbCriteresCoches;
}