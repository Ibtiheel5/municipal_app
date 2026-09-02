// QuittanceResponse.java
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.ModePaiement;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuittanceResponse {
    private String numeroQuittance;
    private String codeRecette;
    private String typeLabel;

    private String proprietaireNom;
    private String proprietaireCin;
    private String proprietaireAdresse;

    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;

    private Integer anneeFiscale;
    private Double montant;
    private LocalDateTime datePaiement;
    private ModePaiement modePaiement;
    private String modePaiementLabel;
    private String agentNom;
}
