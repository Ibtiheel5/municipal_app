package com.municipal.auth.entity;

public enum SourceDossier {
    DECLARATION("Déclaration"),
    RECENSEMENT("Recensement"),
    CONTROLE("Contrôle"),
    AUTRE("Autre");

    private final String label;

    SourceDossier(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
