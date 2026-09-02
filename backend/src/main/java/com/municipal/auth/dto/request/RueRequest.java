package com.municipal.auth.dto.request;

import lombok.Data;

@Data
public class RueRequest {
    private String nom;
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
    private Double taux;
    private Double prixReferenceM2;
    private Double tauxBase;
    private Long secteurId;
}