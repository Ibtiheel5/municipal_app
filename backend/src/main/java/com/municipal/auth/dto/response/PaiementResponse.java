// PaiementResponse.java
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.ModePaiement;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaiementResponse {
    private Long id;
    private Double montant;
    private LocalDateTime datePaiement;
    private ModePaiement modePaiement;
    private String modePaiementLabel;
    private String numeroQuittance;
    private String agentNom;
}
