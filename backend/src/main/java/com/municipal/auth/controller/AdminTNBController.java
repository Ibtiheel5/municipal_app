// AdminTNBController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.DensiteUrbaineRequest;
import com.municipal.auth.dto.request.ValeurVenaleTNBRequest;
import com.municipal.auth.dto.response.DensiteUrbaineResponse;
import com.municipal.auth.dto.response.ValeurVenaleTNBResponse;
import com.municipal.auth.service.AdminTNBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Page Administration > Paramètres TNB.
 * Réservé aux comptes ADMIN.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/tnb")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTNBController {

    private final AdminTNBService adminTNBService;

    // ── Densités urbaines ─────────────────────────────────────────
    @GetMapping("/densites")
    public ResponseEntity<List<DensiteUrbaineResponse>> getDensites() {
        return ResponseEntity.ok(adminTNBService.getDensites());
    }

    @PostMapping("/densites")
    public ResponseEntity<DensiteUrbaineResponse> creerDensite(@RequestBody DensiteUrbaineRequest request) {
        return ResponseEntity.ok(adminTNBService.creerDensite(request));
    }

    @PutMapping("/densites/{id}")
    public ResponseEntity<DensiteUrbaineResponse> modifierDensite(@PathVariable Long id, @RequestBody DensiteUrbaineRequest request) {
        return ResponseEntity.ok(adminTNBService.modifierDensite(id, request));
    }

    @DeleteMapping("/densites/{id}")
    public ResponseEntity<Void> supprimerDensite(@PathVariable Long id) {
        adminTNBService.supprimerDensite(id);
        return ResponseEntity.noContent().build();
    }

    // ── Valeurs vénales (référentiel) ────────────────────────────
    @GetMapping("/valeurs-venales")
    public ResponseEntity<List<ValeurVenaleTNBResponse>> getValeursVenales() {
        return ResponseEntity.ok(adminTNBService.getValeursVenales());
    }

    @PostMapping("/valeurs-venales")
    public ResponseEntity<ValeurVenaleTNBResponse> creerValeurVenale(@RequestBody ValeurVenaleTNBRequest request) {
        return ResponseEntity.ok(adminTNBService.creerValeurVenale(request));
    }

    @PutMapping("/valeurs-venales/{id}")
    public ResponseEntity<ValeurVenaleTNBResponse> modifierValeurVenale(@PathVariable Long id, @RequestBody ValeurVenaleTNBRequest request) {
        return ResponseEntity.ok(adminTNBService.modifierValeurVenale(id, request));
    }

    @DeleteMapping("/valeurs-venales/{id}")
    public ResponseEntity<Void> supprimerValeurVenale(@PathVariable Long id) {
        adminTNBService.supprimerValeurVenale(id);
        return ResponseEntity.noContent().build();
    }
}
