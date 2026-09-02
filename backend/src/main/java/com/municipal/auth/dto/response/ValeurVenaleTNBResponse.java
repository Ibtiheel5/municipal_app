package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class ValeurVenaleTNBResponse {
    private Long id;
    private Double valeurVn;
    private Integer annee;
    private String description;
}
