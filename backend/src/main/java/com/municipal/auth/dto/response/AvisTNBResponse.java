package com.municipal.auth.dto.response;

import com.municipal.auth.entity.MethodeCalculTNB;
import com.municipal.auth.entity.SourceDossier;
import com.municipal.auth.entity.StatutPaiement;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvisTNBResponse {

    private Long id;

    // Section 1
    private String codeTnb;
    private SourceDossier sourceDossier;
    private String sourceDossierLabel;
    private Integer anneeFiscale;
    private LocalDate dateCreation;
    private LocalDate dateDebutImposition;

    // Section 2
    private Long terrainId;
    private String terrainAdresse;
    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietaireCin;
    private Long rueId;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;

    // Section 3
    private MethodeCalculTNB methode;
    private String methodeLabel;
    private Double valeurVenale;
    private Long densiteId;
    private String densiteCategorie;
    private Double prixDensite;
    private Double surface;
    private Double montantTnb;

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
