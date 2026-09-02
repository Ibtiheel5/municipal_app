// TNBGestionController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.GenererAvisTNBRequest;
import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.MethodeCalculTNB;
import com.municipal.auth.entity.StatutPaiement;
import com.municipal.auth.service.TNBGestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.municipal.auth.dto.request.TerrainRequest;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/tnb-gestion")
@RequiredArgsConstructor
public class TNBGestionController {

    private final TNBGestionService tnbGestionService;

    // ── Référentiel densités (section 3) ────────────────────────────────────
    @GetMapping("/densites")
    public ResponseEntity<List<DensiteUrbaineResponse>> getDensites() {
        return ResponseEntity.ok(tnbGestionService.getDensitesActives());
    }

    // ── Section 2 : propriétaires / terrains ────────────────────────────────
    @GetMapping("/proprietaires/recherche")
    public ResponseEntity<List<ProprietaireTNBResponse>> rechercherProprietaires(
            @RequestParam(required = false) String cin,
            @RequestParam(required = false) String nom) {
        return ResponseEntity.ok(tnbGestionService.rechercherProprietaires(cin, nom));
    }

    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<ProprietaireTNBResponse> getProprietaireDetails(@PathVariable Long proprietaireId) {
        return ResponseEntity.ok(tnbGestionService.getProprietaireDetails(proprietaireId));
    }

    @PostMapping("/proprietaires/{proprietaireId}/terrains")
    public ResponseEntity<TerrainResponse> ajouterTerrain(
            @PathVariable Long proprietaireId,
            @RequestBody TerrainRequest request) {
        return ResponseEntity.ok(tnbGestionService.ajouterTerrain(proprietaireId, request));
    }

    // ── Section 1 + 3 + 4 : génération et historique des avis ───────────────
    @PostMapping("/generer-avis")
    public ResponseEntity<AvisTNBResponse> genererAvis(@RequestBody GenererAvisTNBRequest request) {
        log.info("POST /tnb-gestion/generer-avis - terrainId: {}, methode: {}",
                request.getTerrainId(), request.getMethode());
        return ResponseEntity.ok(tnbGestionService.genererAvis(request));
    }

    @GetMapping("/avis/proprietaire/{proprietaireId}")
    public ResponseEntity<List<AvisTNBResponse>> getAvisByProprietaire(@PathVariable Long proprietaireId) {
        return ResponseEntity.ok(tnbGestionService.getAvisByProprietaire(proprietaireId));
    }

    @GetMapping("/avis/historique")
    public ResponseEntity<List<AvisTNBResponse>> rechercherHistorique(
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) StatutPaiement statut,
            @RequestParam(required = false) MethodeCalculTNB methode,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(tnbGestionService.rechercherHistorique(annee, statut, methode, search));
    }

    @GetMapping("/avis/{avisId}")
    public ResponseEntity<AvisTNBResponse> getAvisDetails(@PathVariable Long avisId) {
        return ResponseEntity.ok(tnbGestionService.getAvisDetails(avisId));
    }

    @PutMapping("/avis/{avisId}/payer")
    public ResponseEntity<AvisTNBResponse> marquerPaye(@PathVariable Long avisId) {
        return ResponseEntity.ok(tnbGestionService.marquerPaye(avisId));
    }
}
