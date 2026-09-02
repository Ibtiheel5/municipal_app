// TypeRecette.java
package com.municipal.auth.entity;

public enum TypeRecette {
    TIB("Taxe sur les Immeubles Bâtis"),
    TNB("Taxe sur les Terrains Non Bâtis");

    private final String label;

    TypeRecette(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
