package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class DensiteUrbaineResponse {
    private Long id;
    private String categorie;
    private Double prixDensite;
    private Boolean actif;
}
