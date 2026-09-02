// TIBController.java - Version corrigée
package com.municipal.auth.controller;

import com.municipal.auth.dto.response.TIBResponse;
import com.municipal.auth.entity.Rue;
import com.municipal.auth.service.TIBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/tib")
@RequiredArgsConstructor
public class TIBController {

    private final TIBService tibService;

    /**
     * GET /api/user/tib/rues
     * Récupère toutes les rues pour le calcul TIB
     */
    @GetMapping("/rues")
    public ResponseEntity<List<Rue>> getRuesForTIB() {
        log.info("GET /tib/rues");
        // ✅ Utiliser la méthode existante
        List<Rue> rues = tibService.getRuesForTIB();
        return ResponseEntity.ok(rues);
    }

    /**
     * GET /api/user/tib/rue/{rueId}
     * Récupère les informations TIB d'une rue
     */
    @GetMapping("/rue/{rueId}")
    public ResponseEntity<TIBResponse> getTIBInfo(@PathVariable Long rueId) {
        log.info("GET /tib/rue/{}", rueId);
        // ✅ Utiliser la méthode existante
        TIBResponse response = tibService.getTIBInfo(rueId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/user/tib/calculer
     * Calcule le montant TIB pour une rue et une superficie
     */
    @PostMapping("/calculer")
    public ResponseEntity<TIBResponse> calculerTIB(
            @RequestParam Long rueId,
            @RequestParam Double superficie) {
        log.info("POST /tib/calculer - rueId: {}, superficie: {}", rueId, superficie);
        // ✅ Utiliser la méthode existante
        TIBResponse response = tibService.calculerTIB(rueId, superficie);
        return ResponseEntity.ok(response);
    }
}