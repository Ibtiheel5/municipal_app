// AiExportController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.export.*;
import com.municipal.auth.service.AiExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints d'export en lecture seule consommés par le microservice ai-service
 * (FastAPI) pour l'entraînement et l'inférence des modèles ML :
 *  - scoring de risque de retard/impayé
 *  - prévision des recettes
 *  - détection d'anomalies déclaratives
 *  - segmentation des contribuables
 *
 * Protégé ADMIN : ces routes exposent un volume de données plus large que les
 * routes métier classiques et ne doivent être appelées que par le microservice
 * IA (authentifié avec un compte de service ADMIN dédié), jamais par le frontend.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/ai/export")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AiExportController {

    private final AiExportService aiExportService;

    @GetMapping("/recettes")
    public ResponseEntity<List<RecetteExportDTO>> exportRecettes() {
        log.info("GET /admin/ai/export/recettes");
        return ResponseEntity.ok(aiExportService.exportRecettes());
    }

    @GetMapping("/paiements")
    public ResponseEntity<List<PaiementExportDTO>> exportPaiements() {
        log.info("GET /admin/ai/export/paiements");
        return ResponseEntity.ok(aiExportService.exportPaiements());
    }

    @GetMapping("/proprietaires")
    public ResponseEntity<List<ProprietaireExportDTO>> exportProprietaires() {
        log.info("GET /admin/ai/export/proprietaires");
        return ResponseEntity.ok(aiExportService.exportProprietaires());
    }

    @GetMapping("/avis-tib")
    public ResponseEntity<List<AvisTIBExportDTO>> exportAvisTIB() {
        log.info("GET /admin/ai/export/avis-tib");
        return ResponseEntity.ok(aiExportService.exportAvisTIB());
    }

    @GetMapping("/avis-tnb")
    public ResponseEntity<List<AvisTNBExportDTO>> exportAvisTNB() {
        log.info("GET /admin/ai/export/avis-tnb");
        return ResponseEntity.ok(aiExportService.exportAvisTNB());
    }
}
