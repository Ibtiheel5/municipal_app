// AnneeReleveResponse.java
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.StatutRecette;
import lombok.Data;

@Data
public class AnneeReleveResponse {
    private Integer annee;
    /** Null si l'année n'a pas encore de Recette réelle (projection uniquement, aucun paiement possible tant que non consultée). */
    private Long recetteId;
    private Double montantDu;
    private Double montantPaye;
    private Double montantRestant;
    private StatutRecette statut;
    private String statutLabel;
    /** true dès qu'au moins un paiement existe pour cette année (même partiel) → bouton "Voir quittance" affichable. */
    private Boolean quittanceDisponible;
    /** true si cette ligne est une projection (pas encore d'avis/paiement réel) plutôt qu'une Recette existante. */
    private Boolean projection;
}
