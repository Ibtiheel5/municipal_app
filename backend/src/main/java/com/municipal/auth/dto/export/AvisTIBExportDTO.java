// AvisTIBExportDTO.java
package com.municipal.auth.dto.export;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AvisTIBExportDTO {
    private Long id;
    private String codeTib;
    private String sourceDossier;
    private Integer anneeFiscale;
    private LocalDate dateCreation;
    private LocalDate dateDebutImposition;

    private Long bienId;
    private Long proprietaireId;
    private Long rueId;
    private String secteurNom;

    private Long categorieId;
    private Double prixReferenceM2;
    private Double surface;
    private Double tauxRue;
    private Double coefficient;
    private Double montantTib;
    private Double fraisAdministratifs;
    private Double taxeTotale;

    private String numeroAvis;
    private LocalDate dateAvis;
    private LocalDate dateLimite;
    private String statut;
}
