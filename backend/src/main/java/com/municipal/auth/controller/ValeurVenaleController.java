// ValeurVenaleController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.ValeurVenaleRequest;
import com.municipal.auth.dto.response.ValeurVenaleResponse;
import com.municipal.auth.service.ValeurVenaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/valeurs-venales")
@RequiredArgsConstructor
public class ValeurVenaleController {

    private final ValeurVenaleService valeurVenaleService;

    @GetMapping
    public ResponseEntity<List<ValeurVenaleResponse>> getValeursVenales() {
        log.info("GET /admin/valeurs-venales");
        return ResponseEntity.ok(valeurVenaleService.getValeursVenales());
    }

    @PostMapping
    public ResponseEntity<ValeurVenaleResponse> ajouterValeurVenale(@Valid @RequestBody ValeurVenaleRequest request) {
        log.info("POST /admin/valeurs-venales - Zone: {}", request.getZone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(valeurVenaleService.ajouterValeurVenale(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ValeurVenaleResponse> modifierValeurVenale(
            @PathVariable Long id,
            @Valid @RequestBody ValeurVenaleRequest request) {
        log.info("PUT /admin/valeurs-venales/{}", id);
        return ResponseEntity.ok(valeurVenaleService.modifierValeurVenale(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerValeurVenale(@PathVariable Long id) {
        log.info("DELETE /admin/valeurs-venales/{}", id);
        valeurVenaleService.supprimerValeurVenale(id);
        return ResponseEntity.noContent().build();
    }
}