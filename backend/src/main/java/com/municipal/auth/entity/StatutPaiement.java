package com.municipal.auth.entity;

public enum StatutPaiement {
    EN_ATTENTE("En attente"),
    PARTIELLEMENT_PAYE("Partiellement payé"),
    PAYE("Payé"),
    EN_RETARD("En retard"),
    NON_GENERE("Non généré"); // utilisé pour les années sans avis

    private final String label;

    StatutPaiement(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}