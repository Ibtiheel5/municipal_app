package com.municipal.auth.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class SecteurResponse {
    private Long id;
    private String nom;
    private List<RueResponse> rues;
}