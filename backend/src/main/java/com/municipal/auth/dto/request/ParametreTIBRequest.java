package com.municipal.auth.dto.request;

import lombok.Data;

@Data
public class ParametreTIBRequest {
    private Double fraisAdministratifs;
    private Double coefficientTIB;
    private Integer delaiPaiementJours;
}
