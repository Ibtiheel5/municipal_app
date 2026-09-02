// RecetteController.java (v2)
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.EnregistrerPaiementRequest;
import com.municipal.auth.dto.request.MarquerPayeRequest;
import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.StatutRecette;
import com.municipal.auth.entity.TypeRecette;
import com.municipal.auth.service.RecetteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/recettes")
@RequiredArgsConstructor
public class RecetteController {

    private final RecetteService recetteService;

    // ── "Toutes les recettes" ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<RecetteResponse>> rechercherRecettes(
            @RequestParam(required = false) TypeRecette type,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) StatutRecette statut,
            @RequestParam(required = false) String secteur,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return ResponseEntity.ok(recetteService.rechercherRecettes(
                type, annee, statut, secteur, search, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetteResponse> getRecette(@PathVariable Long id) {
        return ResponseEntity.ok(recetteService.getRecetteById(id));
    }

    @PutMapping("/{id}/payer")
    public ResponseEntity<RecetteResponse> marquerPaye(@PathVariable Long id,
                                                         @RequestBody(required = false) MarquerPayeRequest request) {
        return ResponseEntity.ok(recetteService.marquerPaye(id, request != null ? request.getModePaiement() : null));
    }

    // ── Relevé de compte (recherche par Code TIB/TNB) ───────────────────────

    /** GET /api/user/recettes/releve/TIB-2026-000123 */
    @GetMapping("/releve/{code}")
    public ResponseEntity<ReleveCompteResponse> getReleveCompte(@PathVariable String code) {
        log.info("GET /recettes/releve/{}", code);
        return ResponseEntity.ok(recetteService.getReleveCompte(code));
    }

    // RecetteController.java - Ajout dans la méthode enregistrerPaiement

    @PostMapping("/releve/{code}/annees/{annee}/paiements")
    public ResponseEntity<AnneeReleveResponse> enregistrerPaiement(
            @PathVariable String code,
            @PathVariable Integer annee,
            @RequestBody EnregistrerPaiementRequest request) {
        log.info("POST /recettes/releve/{}/annees/{}/paiements - montant:{}", code, annee, request.getMontant());
        try {
            return ResponseEntity.ok(recetteService.enregistrerPaiementAnnee(
                    code, annee, request.getMontant(), request.getModePaiement()));
        } catch (RuntimeException e) {
            // ✅ Renvoyer un message d'erreur clair
            log.warn("Erreur paiement: {}", e.getMessage());
            throw e; // Le GlobalExceptionHandler le transformera en 400 Bad Request
        }
    }

    /** Liste des quittances (paiements) d'une recette — utile si plusieurs paiements partiels sur la même année. */
    @GetMapping("/{recetteId}/quittances")
    public ResponseEntity<List<PaiementResponse>> getQuittancesByRecette(@PathVariable Long recetteId) {
        return ResponseEntity.ok(recetteService.getQuittancesByRecette(recetteId));
    }

    /** Détail imprimable d'UNE quittance. */
    @GetMapping("/quittances/{numeroQuittance}")
    public ResponseEntity<QuittanceResponse> getQuittance(@PathVariable String numeroQuittance) {
        return ResponseEntity.ok(recetteService.getQuittance(numeroQuittance));
    }
}
