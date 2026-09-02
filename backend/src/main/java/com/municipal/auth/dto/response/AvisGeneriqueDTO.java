package com.municipal.auth.dto.response;

import com.municipal.auth.entity.StatutPaiement;
import com.municipal.auth.entity.TypeRecette;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvisGeneriqueDTO {
    private Long id;
    private String numeroAvis;
    private TypeRecette type;
    private String proprietaireNom;
    private String proprietaireCin;
    private Integer anneeFiscale;
    private Double montant;
    private LocalDate dateGeneration;
    private LocalDate dateLimite;
    private StatutPaiement statut;
    private Long referenceId; // id de l'avis (TIB ou TNB)
}