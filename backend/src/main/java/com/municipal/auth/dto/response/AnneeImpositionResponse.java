package com.municipal.auth.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AnneeImpositionResponse {
    private Integer annee;
    private Boolean genere;
    private Boolean estime;

    private Long avisId;
    private String codeTib;
    private String numeroAvis;

    private Double montant; // montant total dû (taxe totale)
    private Double montantPaye; // somme des paiements
    private Double montantRestant; // montant - montantPaye

    private String statut;       // EN_ATTENTE, PARTIELLEMENT_PAYE, PAYE, EN_RETARD, NON_GENERE
    private String statutLabel;

    private LocalDate dateAvis;
    private LocalDate dateLimite;
    private LocalDateTime datePaiement; // date du dernier paiement ou de la dernière quittance

    // Liste des paiements pour la quittance
    private List<PaiementSummary> paiements;

    @Data
    public static class PaiementSummary {
        private Double montantPaye;
        private String modePaiement;
        private LocalDateTime datePaiement;
        private String reference;
        private String agentNom;
    }
}