// CategorieTIBController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.request.CategorieTIBRequest;
import com.municipal.auth.dto.response.CategorieTIBResponse;
import com.municipal.auth.service.CategorieTIBService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/categories-tib")
@RequiredArgsConstructor
public class CategorieTIBController {

    private final CategorieTIBService categorieTIBService;

    @GetMapping
    public ResponseEntity<List<CategorieTIBResponse>> getCategories() {
        log.info("GET /admin/categories-tib");
        return ResponseEntity.ok(categorieTIBService.getCategories());
    }

    @PostMapping
    public ResponseEntity<CategorieTIBResponse> ajouterCategorie(@Valid @RequestBody CategorieTIBRequest request) {
        log.info("POST /admin/categories-tib - Code: {}", request.getCode());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categorieTIBService.ajouterCategorie(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorieTIBResponse> modifierCategorie(
            @PathVariable Long id,
            @Valid @RequestBody CategorieTIBRequest request) {
        log.info("PUT /admin/categories-tib/{}", id);
        return ResponseEntity.ok(categorieTIBService.modifierCategorie(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCategorie(@PathVariable Long id) {
        log.info("DELETE /admin/categories-tib/{}", id);
        categorieTIBService.supprimerCategorie(id);
        return ResponseEntity.noContent().build();
    }
}