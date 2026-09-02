// UserController.java - Version corrigée
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.RueRequest;
import com.municipal.auth.dto.request.SecteurRequest;
import com.municipal.auth.dto.response.MunicipaliteResponse;
import com.municipal.auth.entity.Rue;
import com.municipal.auth.entity.Secteur;
import com.municipal.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ Retourner le DTO au lieu de l'entité
    @GetMapping("/ma-municipalite")
    public ResponseEntity<MunicipaliteResponse> getMaMunicipalite() {
        log.info("GET /ma-municipalite");
        try {
            MunicipaliteResponse response = userService.getMaMunicipalite();
            log.info("✅ Municipalité retournée: {}", response.getNom());
            if (response.getSecteurs() != null) {
                log.info("✅ {} secteurs retournés", response.getSecteurs().size());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur GET /ma-municipalite: {}", e.getMessage(), e);
            throw e;
        }
    }

    // ── Secteurs ──────────────────────────────────────────────────────────────

    @PostMapping("/secteurs")
    public ResponseEntity<Secteur> ajouterSecteur(@RequestBody SecteurRequest request) {
        log.info("POST /secteurs - Request: {}", request);
        try {
            Secteur secteur = userService.ajouterSecteur(request);
            log.info("POST /secteurs - Secteur créé: {}", secteur);
            return ResponseEntity.status(HttpStatus.CREATED).body(secteur);
        } catch (Exception e) {
            log.error("Erreur POST /secteurs: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/secteurs/{secteurId}")
    public ResponseEntity<Secteur> modifierSecteur(
            @PathVariable Long secteurId,
            @RequestBody SecteurRequest request) {
        log.info("PUT /secteurs/{} - Request: {}", secteurId, request);
        try {
            Secteur secteur = userService.modifierSecteur(secteurId, request);
            log.info("PUT /secteurs/{} - Secteur modifié: {}", secteurId, secteur);
            return ResponseEntity.ok(secteur);
        } catch (Exception e) {
            log.error("Erreur PUT /secteurs/{}: {}", secteurId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/secteurs/{secteurId}")
    public ResponseEntity<Void> supprimerSecteur(@PathVariable Long secteurId) {
        log.info("DELETE /secteurs/{}", secteurId);
        try {
            userService.supprimerSecteur(secteurId);
            log.info("DELETE /secteurs/{} - Supprimé avec succès", secteurId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur DELETE /secteurs/{}: {}", secteurId, e.getMessage(), e);
            throw e;
        }
    }

    // ── Rues ──────────────────────────────────────────────────────────────────

    @PostMapping("/secteurs/{secteurId}/rues")
    public ResponseEntity<Rue> ajouterRue(
            @PathVariable Long secteurId,
            @RequestBody RueRequest request) {
        log.info("POST /secteurs/{}/rues - Request: {}", secteurId, request);
        try {
            Rue rue = userService.ajouterRue(secteurId, request);
            log.info("POST /secteurs/{}/rues - Rue créée: {}", secteurId, rue);
            return ResponseEntity.status(HttpStatus.CREATED).body(rue);
        } catch (Exception e) {
            log.error("Erreur POST /secteurs/{}/rues: {}", secteurId, e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/rues/{rueId}")
    public ResponseEntity<Rue> modifierRue(
            @PathVariable Long rueId,
            @RequestBody RueRequest request) {
        log.info("PUT /rues/{} - Request: {}", rueId, request);
        try {
            Rue rue = userService.modifierRue(rueId, request);
            log.info("PUT /rues/{} - Rue modifiée: {}", rueId, rue);
            return ResponseEntity.ok(rue);
        } catch (Exception e) {
            log.error("Erreur PUT /rues/{}: {}", rueId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/rues/{rueId}")
    public ResponseEntity<Void> supprimerRue(@PathVariable Long rueId) {
        log.info("DELETE /rues/{}", rueId);
        try {
            userService.supprimerRue(rueId);
            log.info("DELETE /rues/{} - Supprimée avec succès", rueId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur DELETE /rues/{}: {}", rueId, e.getMessage(), e);
            throw e;
        }
    }
}