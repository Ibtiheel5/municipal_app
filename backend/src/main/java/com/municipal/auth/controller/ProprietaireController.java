// ProprietaireController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.ProprietaireRequest;
import com.municipal.auth.dto.response.ProprietaireResponse;
import com.municipal.auth.dto.response.ProprietaireListResponse;
import com.municipal.auth.service.ProprietaireService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user/proprietaires")
public class ProprietaireController {

    private final ProprietaireService proprietaireService;

    public ProprietaireController(ProprietaireService proprietaireService) {
        this.proprietaireService = proprietaireService;
    }

    @PostMapping
    public ResponseEntity<ProprietaireResponse> create(@Valid @RequestBody ProprietaireRequest request) {
        return ResponseEntity.ok(proprietaireService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProprietaireResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProprietaireRequest request) {
        return ResponseEntity.ok(proprietaireService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        proprietaireService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProprietaireResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(proprietaireService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ProprietaireListResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long rueId,
            @RequestParam(required = false) Long municipaliteId) {

        Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(proprietaireService.getAll(pageable, search, rueId, municipaliteId));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<ProprietaireResponse>> search(
            @RequestParam(required = false) String cin,
            @RequestParam(required = false) String nom) {
        return ResponseEntity.ok(proprietaireService.search(cin, nom));
    }

    @GetMapping("/rue/{rueId}")
    public ResponseEntity<List<ProprietaireResponse>> getByRue(@PathVariable Long rueId) {
        return ResponseEntity.ok(proprietaireService.getByRue(rueId));
    }

    @GetMapping("/municipalite/{municipaliteId}")
    public ResponseEntity<List<ProprietaireResponse>> getByMunicipalite(@PathVariable Long municipaliteId) {
        return ResponseEntity.ok(proprietaireService.getByMunicipalite(municipaliteId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(proprietaireService.count());
    }
}