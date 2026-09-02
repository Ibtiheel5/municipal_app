package com.municipal.auth.entity;

public enum SourceTIB {
    DECLARATION_PROPRIETAIRE("Déclaration du propriétaire"),
    RECENSEMENT_MUNICIPAL("Recensement municipal"),
    CONTROLE_TERRAIN("Contrôle terrain"),
    AUTRE("Autre");

    private final String label;

    SourceTIB(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}