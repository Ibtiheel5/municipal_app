package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class TerrainResponse {
    private Long id;
    private String reference;
    private String adresse; // alias de reference, pour compat frontend
    private Double surface;
    private Long densiteId;
    private String densiteCategorie;
    private Long rueId;
    private String rueNom;
}
