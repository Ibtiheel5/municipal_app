// ReleveCompteResponse.java
package com.municipal.auth.dto.response;

import com.municipal.auth.entity.TypeRecette;
import lombok.Data;

import java.util.List;

@Data
public class ReleveCompteResponse {
    private String codeRecherche;
    private TypeRecette type;
    private String typeLabel;

    private Long bienId;
    private String bienAdresse;
    private String bienTypeBien;

    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietaireCin;
    private String proprietaireAdresse;

    private String rueNom;
    private String secteurNom;
    private String municipaliteNom;

    private Integer anneeDebutImposition;

    private List<AnneeReleveResponse> annees;

    private Double totalDu;
    private Double totalPaye;
    private Double totalRestant;
}
