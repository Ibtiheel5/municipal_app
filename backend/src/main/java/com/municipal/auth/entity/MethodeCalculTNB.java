package com.municipal.auth.entity;

public enum MethodeCalculTNB {
    VALEUR_VENALE("Valeur Vénale"),
    DENSITE("Densité Urbaine");

    private final String label;

    MethodeCalculTNB(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
