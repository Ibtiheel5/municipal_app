// RecetteExportDTO.java
package com.municipal.auth.dto.export;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO d'export en lecture seule, destiné au microservice IA (ai-service).
 * Ne contient AUCUNE référence d'entité JPA — uniquement des types simples,
 * pour éviter tout risque de sérialisation paresseuse (LazyInitializationException)
 * une fois sorti du contexte transactionnel.
 */
@Data
public class RecetteExportDTO {
    private Long id;
    private String codeRecette;
    private String type; // TIB / TNB
    private Long referenceTaxeId;
    private String numeroAvis;
    private String codeTaxe;

    private Long proprietaireId;
    private Long rueId;
    private Long bienId;
    private Long municipaliteId;
    private String secteurNom;

    private LocalDate dateDebutImposition;
    private Integer anneeFiscale;

    private Double montant;
    private Double montantPaye;

    private LocalDate dateCreation;
    private LocalDate dateGeneration;
    private LocalDate dateLimite;

    private String statut; // EN_ATTENTE / PARTIEL / PAYE / EN_RETARD
}
