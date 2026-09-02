package com.municipal.auth.dto.request;

import lombok.Data;

@Data
public class TerrainRequest {
    private String reference;
    private Double surface;
    private Long densiteId; // optionnel
}