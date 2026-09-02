package com.municipal.auth.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class MunicipaliteResponse {
    private Long id;
    private String nom;
    private String description;
    private List<SecteurResponse> secteurs;
}