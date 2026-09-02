// ValeurVenalePublicController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.response.ValeurVenaleResponse;
import com.municipal.auth.service.AdminTIBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/valeurs-venales")
@RequiredArgsConstructor
public class ValeurVenalePublicController {

    // Source unique : AdminTIBService (valeurs vénales globales gérées par l'admin).
    private final AdminTIBService adminTIBService;

    @GetMapping
    public ResponseEntity<List<ValeurVenaleResponse>> getValeursVenales() {
        log.info("GET /user/valeurs-venales");
        return ResponseEntity.ok(adminTIBService.getValeursVenales());
    }
}