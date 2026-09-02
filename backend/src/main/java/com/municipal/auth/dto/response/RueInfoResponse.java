// RueInfoResponse.java
package com.municipal.auth.dto.response;

import lombok.Data;

@Data
public class RueInfoResponse {
    private Long id;
    private String nom;
    private String secteurNom;
    private Double taux;
    private Double prixReferenceM2;  // ✅ Ajout du champ
    private Integer nbProprietaires;
}