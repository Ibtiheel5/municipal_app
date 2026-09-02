package com.municipal.auth.controller;

import com.municipal.auth.dto.request.AvisTIBRequest;
import com.municipal.auth.dto.response.AvisTIBResponse;
import com.municipal.auth.entity.StatutPaiement;
import com.municipal.auth.service.AvisTIBService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/avis-tib")
@RequiredArgsConstructor
public class AvisTIBController {

    private final AvisTIBService avisTIBService;

    @PostMapping("/generer")
    public ResponseEntity<AvisTIBResponse> genererAvis(@Valid @RequestBody AvisTIBRequest request) {
        log.info("POST /avis-tib/generer - Bien: {}, Année: {}", request.getBienId(), request.getAnneeFiscale());
        return ResponseEntity.ok(avisTIBService.genererAvis(request));
    }

    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<List<AvisTIBResponse>> getAvisByProprietaire(@PathVariable Long proprietaireId) {
        log.info("GET /avis-tib/proprietaire/{}", proprietaireId);
        return ResponseEntity.ok(avisTIBService.getAvisByProprietaire(proprietaireId));
    }

    @GetMapping("/{avisId}")
    public ResponseEntity<AvisTIBResponse> getAvisDetails(@PathVariable Long avisId) {
        log.info("GET /avis-tib/{}", avisId);
        return ResponseEntity.ok(avisTIBService.getAvisDetails(avisId));
    }

    @GetMapping("/recherche")
    public ResponseEntity<Page<AvisTIBResponse>> rechercherAvis(
            @RequestParam(required = false) Integer anneeFiscale,
            @RequestParam(required = false) StatutPaiement statut,
            @RequestParam(required = false) Long rueId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // Récupération de la municipalité via l'email (à adapter selon votre contexte)
        Long municipaliteId = 1L; // À remplacer par la vraie récupération

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateGeneration"));
        return ResponseEntity.ok(avisTIBService.getAvisWithFilters(
                municipaliteId, anneeFiscale, statut, rueId, search, pageable));
    }

    @PutMapping("/{avisId}/payer")
    public ResponseEntity<AvisTIBResponse> marquerPaye(@PathVariable Long avisId) {
        log.info("PUT /avis-tib/{}/payer", avisId);
        return ResponseEntity.ok(avisTIBService.marquerPaye(avisId));
    }

    @DeleteMapping("/{avisId}")
    public ResponseEntity<Void> supprimerAvis(@PathVariable Long avisId) {
        log.info("DELETE /avis-tib/{}", avisId);
        avisTIBService.supprimerAvis(avisId);
        return ResponseEntity.noContent().build();
    }
}