package com.municipal.auth.controller;

import com.municipal.auth.dto.request.PaiementRequest;
import com.municipal.auth.dto.response.AnneeImpositionResponse;
import com.municipal.auth.dto.response.ConsultationTaxeResponse;
import com.municipal.auth.dto.response.QuittanceResponse;
import com.municipal.auth.service.ConsultationTaxeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user/consultation")
@RequiredArgsConstructor
public class ConsultationTaxeController {

    private final ConsultationTaxeService consultationTaxeService;

    // ── TIB ──────────────────────────────────────────────────────────────────

    @GetMapping("/tib/{codeTib}")
    public ResponseEntity<ConsultationTaxeResponse> consulterTib(@PathVariable String codeTib) {
        return ResponseEntity.ok(consultationTaxeService.consulterParCodeTib(codeTib));
    }

    @PostMapping("/tib/{codeTib}/generer/{annee}")
    public ResponseEntity<AnneeImpositionResponse> genererAnneeTib(
            @PathVariable String codeTib,
            @PathVariable Integer annee) {
        return ResponseEntity.ok(consultationTaxeService.genererAvisPourAnnee(codeTib, annee));
    }

    @PostMapping("/tib/{codeTib}/payer/{annee}")
    public ResponseEntity<AnneeImpositionResponse> enregistrerPaiementTib(
            @PathVariable String codeTib,
            @PathVariable Integer annee,
            @RequestBody PaiementRequest request) {
        return ResponseEntity.ok(consultationTaxeService.enregistrerPaiementTib(codeTib, annee, request));
    }

    @GetMapping("/tib/quittance/{avisId}")
    public ResponseEntity<QuittanceResponse> getQuittanceTib(@PathVariable Long avisId) {
        return ResponseEntity.ok(consultationTaxeService.getQuittanceTib(avisId));
    }

    // ── TNB (à débloquer plus tard) ─────────────────────────────────────────

    @GetMapping("/tnb/{codeTnb}")
    public ResponseEntity<ConsultationTaxeResponse> consulterTnb(@PathVariable String codeTnb) {
        return ResponseEntity.ok(consultationTaxeService.consulterParCodeTnb(codeTnb));
    }

    @PostMapping("/tnb/{codeTnb}/payer/{annee}")
    public ResponseEntity<AnneeImpositionResponse> enregistrerPaiementTnb(
            @PathVariable String codeTnb,
            @PathVariable Integer annee,
            @RequestBody PaiementRequest request) {
        return ResponseEntity.ok(consultationTaxeService.enregistrerPaiementTnb(codeTnb, annee, request));
    }

    @GetMapping("/tnb/quittance/{avisId}")
    public ResponseEntity<QuittanceResponse> getQuittanceTnb(@PathVariable Long avisId) {
        return ResponseEntity.ok(consultationTaxeService.getQuittanceTnb(avisId));
    }
}