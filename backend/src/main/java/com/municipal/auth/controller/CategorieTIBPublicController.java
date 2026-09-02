// CategorieTIBPublicController.java
package com.municipal.auth.controller;

import com.municipal.auth.dto.response.CategorieTIBResponse;
import com.municipal.auth.service.AdminTIBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/user/categories-tib")
@RequiredArgsConstructor
public class CategorieTIBPublicController {

    // Source unique : AdminTIBService (catégories globales gérées par l'admin).
    private final AdminTIBService adminTIBService;

    @GetMapping
    public ResponseEntity<List<CategorieTIBResponse>> getCategories() {
        log.info("GET /user/categories-tib");
        List<CategorieTIBResponse> actives = adminTIBService.getCategories().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActif()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(actives);
    }
}