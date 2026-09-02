package com.municipal.auth.dto.request;

import lombok.Data;

/**
 * Utilisé pour le calcul en temps réel (section 3), avant génération de l'avis.
 * bienId sert à retrouver automatiquement la surface et le taux de la rue ;
 * surface peut être surchargée manuellement par l'utilisateur.
 */
@Data
public class CalculTIBRequest {
    private Long bienId;
    private Long categorieId;
    private Double surface;              // optionnel : sinon on prend bien.superficie
    private Double fraisAdministratifs;  // optionnel : sinon on prend le paramètre global
}
