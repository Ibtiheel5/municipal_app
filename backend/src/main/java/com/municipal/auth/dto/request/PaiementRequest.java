package com.municipal.auth.dto.request;

import lombok.Data;

@Data
public class PaiementRequest {
    private Double montant;
    private String modePaiement; // ESPECES, CHEQUE, VIREMENT, etc.
    private String referenceTransaction;
}