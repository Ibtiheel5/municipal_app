// AvisPaiementRequest.java
package com.municipal.auth.dto.request;

import lombok.Data;

@Data
public class AvisPaiementRequest {
    private Long bienId;
    private Double surface;
    private String observations;
}