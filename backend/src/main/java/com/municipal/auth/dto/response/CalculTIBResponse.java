package com.municipal.auth.dto.response;

import lombok.Data;

/**
 * Détail du calcul affiché en temps réel dans la section 3.
 * MontantTIB = prixReferenceM2 × surface × coefficient × tauxRue
 * TaxeTotale = MontantTIB + fraisAdministratifs
 */
@Data
public class CalculTIBResponse {
    private Long categorieId;
    private String categorieLibelle;
    private Double prixReferenceM2;
    private Double surface;
    private Double tauxRue;
    private Double coefficient;
    private Double montantTib;
    private Double fraisAdministratifs;
    private Double taxeTotale;
    private String formule; // texte explicatif affiché à l'écran
}
