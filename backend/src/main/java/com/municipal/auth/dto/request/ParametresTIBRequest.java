package com.municipal.auth.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ParametresTIBRequest {

    @NotNull(message = "Le taux de base est obligatoire")
    @Positive(message = "Le taux doit être positif")
    private Double tauxBase;

    @NotNull(message = "Les frais administratifs sont obligatoires")
    @Positive(message = "Les frais doivent être positifs")
    private Double fraisAdministratifs;

    @NotNull(message = "Le délai de paiement est obligatoire")
    @Positive(message = "Le délai doit être positif")
    private Integer delaiPaiementJours;

    private String prefixCodeTIB;
    private String prefixNumeroAvis;
}