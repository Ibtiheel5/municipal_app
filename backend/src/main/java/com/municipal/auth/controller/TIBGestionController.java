// TIBGestionController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.CalculTIBRequest;
import com.municipal.auth.dto.request.GenererAvisTIBRequest;
import com.municipal.auth.dto.response.*;
import com.municipal.auth.entity.StatutPaiement;
import com.municipal.auth.service.TIBGestionService;
import com.municipal.auth.service.AdminTIBService;
import com.municipal.auth.entity.ParametreTIB;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user/tib-gestion")
@RequiredArgsConstructor
public class TIBGestionController {

    private final TIBGestionService tibGestionService;
    private final AdminTIBService adminTIBService;

    // ── Section 2 : rues / propriétaires / biens ────────────────────────────

    @GetMapping("/rues")
    public ResponseEntity<List<RueInfoResponse>> getRues() {
        return ResponseEntity.ok(tibGestionService.getRues());
    }

    @GetMapping("/proprietaires/rue/{rueId}")
    public ResponseEntity<List<ProprietaireResponse>> getProprietairesByRue(@PathVariable Long rueId) {
        return ResponseEntity.ok(tibGestionService.getProprietairesByRue(rueId));
    }

    @GetMapping("/proprietaires/recherche")
    public ResponseEntity<List<ProprietaireResponse>> rechercherProprietaires(
            @RequestParam(required = false) String cin,
            @RequestParam(required = false) String nom) {
        return ResponseEntity.ok(tibGestionService.rechercherProprietaires(cin, nom));
    }

    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<ProprietaireResponse> getProprietaireDetails(@PathVariable Long proprietaireId) {
        return ResponseEntity.ok(tibGestionService.getProprietaireDetails(proprietaireId));
    }

    @GetMapping("/bien/{bienId}")
    public ResponseEntity<BienImmobilierResponse> getBienDetails(@PathVariable Long bienId) {
        return ResponseEntity.ok(tibGestionService.getBienDetails(bienId));
    }

    // ── Section 3 : catégories + calcul temps réel ──────────────────────────

    // Endpoint /categories retiré : doublon de /api/user/categories-tib
    // (CategorieTIBPublicController), qui est désormais la source unique.

    /**
     * GET /api/user/tib-gestion/parametres
     * Lecture seule des paramètres globaux (frais admin, coefficient, délai),
     * accessible aux USER et ADMIN — contrairement à /api/admin/tib/parametres
     * qui est réservé ADMIN et provoquait un 403 côté utilisateur.
     */
    @GetMapping("/parametres")
    public ResponseEntity<ParametreTIBResponse> getParametres() {
        ParametreTIB p = adminTIBService.getOrCreateParametre();
        ParametreTIBResponse r = new ParametreTIBResponse();
        r.setId(p.getId());
        r.setFraisAdministratifs(p.getFraisAdministratifs());
        r.setCoefficientTIB(p.getCoefficientTIB());
        r.setDelaiPaiementJours(p.getDelaiPaiementJours());
        return ResponseEntity.ok(r);
    }

    @PostMapping("/calculer")
    public ResponseEntity<CalculTIBResponse> simulerCalcul(@RequestBody CalculTIBRequest request) {
        return ResponseEntity.ok(tibGestionService.simulerCalcul(request));
    }

    // ── Section 1 + 4 : génération et historique des avis ───────────────────

    @PostMapping("/generer-avis")
    public ResponseEntity<AvisTIBResponse> genererAvis(@RequestBody GenererAvisTIBRequest request) {
        log.info("POST /tib-gestion/generer-avis - bienId: {}, categorieId: {}", request.getBienId(), request.getCategorieId());
        return ResponseEntity.ok(tibGestionService.genererAvis(request));
    }

    @GetMapping("/avis/proprietaire/{proprietaireId}")
    public ResponseEntity<List<AvisTIBResponse>> getAvisByProprietaire(@PathVariable Long proprietaireId) {
        return ResponseEntity.ok(tibGestionService.getAvisByProprietaire(proprietaireId));
    }

    @GetMapping("/avis/historique")
    public ResponseEntity<List<AvisTIBResponse>> rechercherHistorique(
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) Long rueId,
            @RequestParam(required = false) Long proprietaireId,
            @RequestParam(required = false) StatutPaiement statut) {
        return ResponseEntity.ok(tibGestionService.rechercherHistorique(annee, rueId, proprietaireId, statut));
    }

    @GetMapping("/avis/{avisId}")
    public ResponseEntity<AvisTIBResponse> getAvisDetails(@PathVariable Long avisId) {
        return ResponseEntity.ok(tibGestionService.getAvisDetails(avisId));
    }

    @PutMapping("/avis/{avisId}/payer")
    public ResponseEntity<AvisTIBResponse> marquerPaye(
            @PathVariable Long avisId,
            @RequestBody(required = false) Map<String, String> body) {
        String modePaiement = body != null ? body.get("modePaiement") : null;
        String reference = body != null ? body.get("reference") : null;
        return ResponseEntity.ok(tibGestionService.marquerPaye(avisId, modePaiement, reference));
    }
}