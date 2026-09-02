package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class DashboardRecettesStats {
    private double totalRecettes;
    private double totalTIB;
    private double totalTNB;
    private long avisGeneres;
    private long avisEnAttente;
    private long avisPayes;
    private long avisEnRetard;
    private long paiementsAujourdhui;
    private double totalEncaissementJour;
    private double totalEncaissementMois;
    private double totalEncaissementAnnee;
}