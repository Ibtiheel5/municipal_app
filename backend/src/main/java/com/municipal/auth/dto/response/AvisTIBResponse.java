package com.municipal.auth.dto.response;

import com.municipal.auth.entity.SourceDossier;
import com.municipal.auth.entity.StatutPaiement;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvisTIBResponse {

    private Long id;

    // Section 1
    private String codeTib;
    private SourceDossier sourceDossier;
    private String sourceDossierLabel;
    private Integer anneeFiscale;
    private LocalDate dateCreation;
    private LocalDate dateDebutImposition;

    // Section 2
    private Long bienId;
    private String bienAdresse;
    private String typeBien;
    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietaireCin;
    private Long rueId;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;

    // Section 3
    private String categorieLibelle;
    private Double prixReferenceM2;
    private Double surface;
    private Double tauxRue;
    private Double coefficient;
    private Double montantTib;
    private Double fraisAdministratifs;
    private Double taxeTotale;

    // Section 4
    private String numeroAvis;
    private LocalDate dateAvis;
    private LocalDate dateLimite;
    private Long joursRestants;
    private Boolean estEnRetard;
    private StatutPaiement statut;
    private String statutLabel;
    private String observations;
}
