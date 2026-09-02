package com.municipal.auth.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ProprietaireTNBResponse {
    private Long id;
    private String cin;
    private String nom;
    private String prenom;
    private String telephone;
    private String adresse;
    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;
    private List<TerrainResponse> terrains;
}
