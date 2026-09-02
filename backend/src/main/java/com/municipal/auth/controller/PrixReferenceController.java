// PrixReferenceController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.response.PrixReferenceResponse;
import com.municipal.auth.service.PrixReferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/prix-reference")
@RequiredArgsConstructor
public class PrixReferenceController {

    private final PrixReferenceService prixReferenceService;

    @GetMapping
    public ResponseEntity<List<PrixReferenceResponse>> getPrixReferences() {
        log.info("GET /prix-reference");
        return ResponseEntity.ok(prixReferenceService.getPrixReferences());
    }

    @GetMapping("/annees")
    public ResponseEntity<List<Integer>> getAnneesFiscales() {
        log.info("GET /prix-reference/annees");
        return ResponseEntity.ok(prixReferenceService.getAnneesFiscales());
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getTypesBien() {
        log.info("GET /prix-reference/types");
        return ResponseEntity.ok(prixReferenceService.getTypesBien());
    }

    @GetMapping("/calculer")
    public ResponseEntity<Double> calculerMontantTIB(
            @RequestParam Integer anneeFiscale,
            @RequestParam String typeBien,
            @RequestParam Double superficie,
            @RequestParam Double taux) {
        log.info("GET /prix-reference/calculer - année: {}, type: {}, surface: {}, taux: {}",
                anneeFiscale, typeBien, superficie, taux);
        return ResponseEntity.ok(prixReferenceService.calculerMontantTIB(anneeFiscale, typeBien, superficie, taux));
    }
}