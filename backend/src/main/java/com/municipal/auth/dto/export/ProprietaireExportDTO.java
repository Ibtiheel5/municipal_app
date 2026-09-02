// ProprietaireExportDTO.java
package com.municipal.auth.dto.export;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProprietaireExportDTO {
    private Long id;
    private String cin;
    private LocalDate dateNaissance;
    private Double superficie;
    private String typeBien;

    private Long rueId;
    private String secteurNom;
    private Long municipaliteId;
    private String municipaliteNom;

    // Volontairement exclus : nom, prénom, téléphone, email, adresse.
    // Le dataset ML n'a besoin d'aucune donnée directement identifiante ;
    // le rapprochement avec l'identité se fait uniquement côté Spring Boot
    // via l'id, au moment d'afficher un score dans l'UI.
}
