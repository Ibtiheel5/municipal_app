// EnregistrerPaiementRequest.java
package com.municipal.auth.dto.request;

import com.municipal.auth.entity.ModePaiement;
import lombok.Data;

@Data
public class EnregistrerPaiementRequest {
    private Double montant;
    private ModePaiement modePaiement;
}
