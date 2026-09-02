package com.municipal.auth.dto.response;

import com.municipal.auth.entity.ModePaiement;
import com.municipal.auth.entity.StatutPaiement;
import com.municipal.auth.entity.TypeRecette;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RecetteDetailDTO {
    private Long id;
    private String codeRecette;
    private String numeroAvis;
    private TypeRecette type;
    private Long referenceTaxeId;
    private String proprietaireNom;
    private String proprietaireCin;
    private String adresse;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;
    private Integer anneeFiscale;
    private Double montant;
    private LocalDate dateCreation;
    private LocalDate dateGeneration;
    private LocalDate dateLimite;
    private StatutPaiement statut;
    private LocalDateTime datePaiement;
    private ModePaiement modePaiement;
}