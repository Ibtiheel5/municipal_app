// PaiementExportDTO.java
package com.municipal.auth.dto.export;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaiementExportDTO {
    private Long id;
    private Long recetteId;
    private Double montant;
    private LocalDateTime datePaiement;
    private String modePaiement;
    private String numeroQuittance;
    private String agentNom;
}
