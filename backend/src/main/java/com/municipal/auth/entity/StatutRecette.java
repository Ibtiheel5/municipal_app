// StatutRecette.java
package com.municipal.auth.entity;

/**
 * Statut d'une Recette pour UNE année donnée. Distinct de StatutPaiement
 * (utilisé par AvisPaiement/AvisTIB côté TIB) car une Recette supporte
 * désormais les paiements partiels — un avis TIB, lui, reste "tout ou rien".
 */
public enum StatutRecette {
    EN_ATTENTE("En attente"),
    PARTIEL("Partiellement payé"),
    PAYE("Payé"),
    EN_RETARD("En retard");

    private final String label;

    StatutRecette(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
