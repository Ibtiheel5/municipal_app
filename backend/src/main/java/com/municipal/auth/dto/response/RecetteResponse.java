// RecetteResponse.java (v2)
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.ModePaiement;
import com.municipal.auth.entity.StatutRecette;
import com.municipal.auth.entity.TypeRecette;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RecetteResponse {
    private Long id;
    private String codeRecette;
    private TypeRecette type;
    private String typeLabel;
    private Long referenceTaxeId;
    private String numeroAvis;

    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietaireCin;

    private Long rueId;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;
    private Long municipaliteId;

    private Integer anneeFiscale;
    private Double montant;
    private Double montantPaye;
    private Double montantRestant;

    private LocalDate dateCreation;
    private LocalDate dateGeneration;
    private LocalDate dateLimite;

    private StatutRecette statut;
    private String statutLabel;
    private Boolean estEnRetard;

    /** Infos du DERNIER paiement enregistré (s'il y en a un) — pour l'affichage rapide dans la modale existante. */
    private LocalDateTime datePaiement;
    private ModePaiement modePaiement;
    private String modePaiementLabel;
}
