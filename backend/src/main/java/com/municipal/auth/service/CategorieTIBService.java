// CategorieTIBService.java - Version corrigée
package com.municipal.auth.service;

import com.municipal.auth.dto.request.CategorieTIBRequest;
import com.municipal.auth.dto.response.CategorieTIBResponse;
import com.municipal.auth.entity.CategorieTIB;
import com.municipal.auth.entity.User;
import com.municipal.auth.repository.CategorieTIBRepository;
import com.municipal.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategorieTIBService {

    private final CategorieTIBRepository categorieTIBRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Récupère toutes les catégories TIB actives de la municipalité
     */
    public List<CategorieTIBResponse> getCategories() {
        User user = getCurrentUser();

        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // ✅ Correction: findByMunicipaliteIdAndActifTrueOrderByLibelleAsc
        return categorieTIBRepository
                .findByMunicipaliteIdAndActifTrueOrderByLibelleAsc(user.getMunicipalite().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Ajoute une nouvelle catégorie TIB
     */
    @Transactional
    public CategorieTIBResponse ajouterCategorie(CategorieTIBRequest request) {
        User user = getCurrentUser();

        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // ✅ Correction: existsByCodeAndMunicipaliteId
        if (categorieTIBRepository.existsByCodeAndMunicipaliteId(request.getCode(), user.getMunicipalite().getId())) {
            throw new RuntimeException("Une catégorie avec ce code existe déjà");
        }

        CategorieTIB categorie = new CategorieTIB();
        categorie.setCode(request.getCode());
        categorie.setLibelle(request.getLibelle());
        categorie.setPrixReferenceM2(request.getPrixReferenceM2());
        categorie.setDescription(request.getDescription());  // ✅ getDescription()
        categorie.setOrdreAffichage(request.getOrdreAffichage() != null ? request.getOrdreAffichage() : 0);
        categorie.setMunicipalite(user.getMunicipalite());   // ✅ setMunicipalite()
        categorie.setActif(request.getActif() != null ? request.getActif() : true);

        categorie = categorieTIBRepository.save(categorie);
        log.info("Catégorie TIB ajoutée: {} - {} DT/m²", request.getCode(), request.getPrixReferenceM2());

        return mapToResponse(categorie);
    }

    /**
     * Modifie une catégorie TIB existante
     */
    @Transactional
    public CategorieTIBResponse modifierCategorie(Long id, CategorieTIBRequest request) {
        User user = getCurrentUser();

        CategorieTIB categorie = categorieTIBRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        // ✅ Correction: getMunicipalite()
        if (!categorie.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        // Vérifier si le code existe déjà (pour un autre enregistrement)
        categorieTIBRepository.findByCode(request.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Une catégorie avec ce code existe déjà");
                    }
                });

        categorie.setCode(request.getCode());
        categorie.setLibelle(request.getLibelle());
        categorie.setPrixReferenceM2(request.getPrixReferenceM2());
        categorie.setDescription(request.getDescription());  // ✅ getDescription()
        categorie.setOrdreAffichage(request.getOrdreAffichage() != null ? request.getOrdreAffichage() : 0);
        categorie.setActif(request.getActif() != null ? request.getActif() : true);

        categorie = categorieTIBRepository.save(categorie);
        log.info("Catégorie TIB modifiée: ID {}", id);

        return mapToResponse(categorie);
    }

    /**
     * Supprime une catégorie TIB (suppression physique)
     */
    @Transactional
    public void supprimerCategorie(Long id) {
        User user = getCurrentUser();

        CategorieTIB categorie = categorieTIBRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        // ✅ Correction: getMunicipalite()
        if (!categorie.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        // Suppression logique (désactivation) préférée
        categorie.setActif(false);
        categorieTIBRepository.save(categorie);
        log.info("Catégorie TIB désactivée: ID {}", id);

        // Ou suppression physique (à utiliser avec précaution)
        // categorieTIBRepository.deleteById(id);
    }

    /**
     * Désactive une catégorie TIB (suppression logique)
     */
    @Transactional
    public CategorieTIBResponse desactiverCategorie(Long id) {
        User user = getCurrentUser();

        CategorieTIB categorie = categorieTIBRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        if (!categorie.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        categorie.setActif(false);
        categorie = categorieTIBRepository.save(categorie);
        log.info("Catégorie TIB désactivée: ID {}", id);

        return mapToResponse(categorie);
    }

    /**
     * Mapping vers le DTO de réponse
     */
    private CategorieTIBResponse mapToResponse(CategorieTIB categorie) {
        CategorieTIBResponse response = new CategorieTIBResponse();
        response.setId(categorie.getId());
        response.setCode(categorie.getCode());
        response.setLibelle(categorie.getLibelle());
        response.setPrixReferenceM2(categorie.getPrixReferenceM2());
        response.setDescription(categorie.getDescription());  // ✅ getDescription()
        response.setOrdreAffichage(categorie.getOrdreAffichage());
        response.setActif(categorie.getActif());
        return response;
    }
}