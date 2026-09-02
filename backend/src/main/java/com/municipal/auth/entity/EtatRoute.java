// EtatRoute.java
package com.municipal.auth.entity;

public enum EtatRoute {
    BONNE("Bonne"),
    MOYENNE("Moyenne"),
    DEGRADEE("Dégradée");

    private final String label;

    EtatRoute(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}