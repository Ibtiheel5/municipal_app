// AvisPaiementResponse.java
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.StatutPaiement;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AvisPaiementResponse {
    private Long id;
    private String numeroAvis;
    private LocalDate dateEmission;
    private LocalDate dateLimite;
    private Double montant;
    private Double surface;
    private Double taux;
    private StatutPaiement statut;
    private String statutLabel;
    private LocalDateTime datePaiement;
    private String observations;
    private String proprietaireNom;
    private String bienAdresse;
    private String rueNom;
    private Long joursRestants;
    private Boolean estEnRetard;
}