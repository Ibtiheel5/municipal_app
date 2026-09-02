package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class ParametreTIBResponse {
    private Long id;
    private Double fraisAdministratifs;
    private Double coefficientTIB;
    private Integer delaiPaiementJours;
}
