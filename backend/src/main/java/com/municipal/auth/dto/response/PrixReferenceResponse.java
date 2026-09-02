// PrixReferenceResponse.java
package com.municipal.auth.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PrixReferenceResponse {
    private Long id;
    private Integer anneeFiscale;
    private String typeBien;
    private Double prixM2;
    private String municipaliteNom;
    private LocalDate dateCreation;
    private LocalDate dateModification;
}