// ModePaiement.java
package com.municipal.auth.entity;

public enum ModePaiement {
    ESPECES("Espèces"),
    CHEQUE("Chèque"),
    VIREMENT("Virement"),
    CARTE_BANCAIRE("Carte bancaire");

    private final String label;

    ModePaiement(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
