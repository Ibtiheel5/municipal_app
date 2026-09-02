// ConsultationTaxeResponse.java
package com.municipal.auth.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * Réponse complète pour la page "Consultation des Recettes" :
 * infos du dossier (propriétaire, bien, municipalité) + la liste de toutes
 * les années d'imposition depuis la date de début d'imposition jusqu'à
 * l'année fiscale en cours, + le récapitulatif financier.
 */
@Data
public class ConsultationTaxeResponse {

    private String codeTaxe;     // code TIB (ou TNB, à venir) saisi par l'agent
    private String typeTaxe;     // "TIB" pour l'instant

    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietaireCin;
    private String adresse;
    private String municipaliteNom;
    private String secteurNom;

    // Utile pour l'action "Générer avis" côté service (référentiel du bien)
    private Long bienId;
    private Long categorieId;
    private Double surface;
    private Long valeurVenaleId;

    private LocalDate dateDebutImposition;
    private Integer anneeFiscaleActuelle;

    private List<AnneeImpositionResponse> anneesImposition;

    private Integer nbAnneesTotal;
    private Integer nbAnneesPayees;
    private Integer nbAnneesNonPayees;
    private Double totalPaye;
    private Double totalRestant;
}