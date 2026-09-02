// TIBResponse.java - Version complète
package com.municipal.auth.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TIBResponse {
    // Informations de la rue
    private Long rueId;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;

    // Données pour le calcul
    private Double prixReferenceM2;
    private Double superficie;
    private Double tauxBase;
    private Double taux;
    private Double montantTIB;
    private Double taxeTotale;          // ✅ Ajouté
    private String montantFormate;
    private String taxeTotaleFormate;    // ✅ Ajouté
    private Integer nbCriteresCoches;

    // Équipements
    private Boolean eclairagePublic;
    private Boolean assainissement;
    private Boolean eauPotable;
    private Boolean electricite;
    private Boolean voirie;
    private Boolean proprete;
    private Boolean autreCritere;
    private String autreCritereDetails;

    // Coordonnées
    private Double latitude;
    private Double longitude;
}