// AvisTNBExportDTO.java
package com.municipal.auth.dto.export;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AvisTNBExportDTO {
    private Long id;
    private String codeTnb;
    private String sourceDossier;
    private Integer anneeFiscale;
    private LocalDate dateCreation;
    private LocalDate dateDebutImposition;

    private Long terrainId;
    private Long proprietaireId;
    private Long rueId;
    private String secteurNom;

    private String methode; // VALEUR_VENALE / DENSITE
    private Double valeurVenale;
    private Long densiteId;
    private Double surface;
    private Double montantTnb;

    private String numeroAvis;
    private LocalDate dateAvis;
    private LocalDate dateLimite;
    private String statut;
}
