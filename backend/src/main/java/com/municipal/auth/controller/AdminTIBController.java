// AdminTIBController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.CategorieTIBRequest;
import com.municipal.auth.dto.request.ParametreTIBRequest;
import com.municipal.auth.dto.request.ValeurVenaleRequest;
import com.municipal.auth.dto.response.CategorieTIBResponse;
import com.municipal.auth.dto.response.ParametreTIBResponse;
import com.municipal.auth.dto.response.ValeurVenaleResponse;
import com.municipal.auth.service.AdminTIBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Page Administration > Paramètres TIB.
 * Réservé aux comptes ADMIN (adapter le rôle selon votre modèle de sécurité existant).
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/tib")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTIBController {

    private final AdminTIBService adminTIBService;

    // ── Catégories TIB ───────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<List<CategorieTIBResponse>> getCategories() {
        return ResponseEntity.ok(adminTIBService.getCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategorieTIBResponse> creerCategorie(@RequestBody CategorieTIBRequest request) {
        return ResponseEntity.ok(adminTIBService.creerCategorie(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategorieTIBResponse> modifierCategorie(@PathVariable Long id, @RequestBody CategorieTIBRequest request) {
        return ResponseEntity.ok(adminTIBService.modifierCategorie(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> supprimerCategorie(@PathVariable Long id) {
        adminTIBService.supprimerCategorie(id);
        return ResponseEntity.noContent().build();
    }

    // ── Valeurs vénales ──────────────────────────────────────────
    @GetMapping("/valeurs-venales")
    public ResponseEntity<List<ValeurVenaleResponse>> getValeursVenales() {
        return ResponseEntity.ok(adminTIBService.getValeursVenales());
    }

    @PostMapping("/valeurs-venales")
    public ResponseEntity<ValeurVenaleResponse> creerValeurVenale(@RequestBody ValeurVenaleRequest request) {
        return ResponseEntity.ok(adminTIBService.creerValeurVenale(request));
    }

    @PutMapping("/valeurs-venales/{id}")
    public ResponseEntity<ValeurVenaleResponse> modifierValeurVenale(@PathVariable Long id, @RequestBody ValeurVenaleRequest request) {
        return ResponseEntity.ok(adminTIBService.modifierValeurVenale(id, request));
    }

    @DeleteMapping("/valeurs-venales/{id}")
    public ResponseEntity<Void> supprimerValeurVenale(@PathVariable Long id) {
        adminTIBService.supprimerValeurVenale(id);
        return ResponseEntity.noContent().build();
    }

    // ── Paramètres globaux (frais administratifs, coefficient) ───
    @GetMapping("/parametres")
    public ResponseEntity<ParametreTIBResponse> getParametres() {
        return ResponseEntity.ok(adminTIBService.getParametres());
    }

    @PutMapping("/parametres")
    public ResponseEntity<ParametreTIBResponse> modifierParametres(@RequestBody ParametreTIBRequest request) {
        return ResponseEntity.ok(adminTIBService.modifierParametres(request));
    }
}
