// MarquerPayeRequest.java
package com.municipal.auth.dto.request;

import com.municipal.auth.entity.ModePaiement;
import lombok.Data;

@Data
public class MarquerPayeRequest {
    private ModePaiement modePaiement;
}
