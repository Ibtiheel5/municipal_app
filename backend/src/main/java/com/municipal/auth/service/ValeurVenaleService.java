// ValeurVenaleService.java - Version complète corrigée
package com.municipal.auth.service;

import com.municipal.auth.dto.request.ValeurVenaleRequest;
import com.municipal.auth.dto.response.ValeurVenaleResponse;
import com.municipal.auth.entity.Municipalite;
import com.municipal.auth.entity.User;
import com.municipal.auth.entity.ValeurVenale;
import com.municipal.auth.repository.UserRepository;
import com.municipal.auth.repository.ValeurVenaleRepository;
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
public class ValeurVenaleService {

    private final ValeurVenaleRepository valeurVenaleRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Récupère toutes les valeurs vénales actives de la municipalité de l'utilisateur
     */
    public List<ValeurVenaleResponse> getValeursVenales() {
        User user = getCurrentUser();

        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // ✅ Correction: findByMunicipaliteIdAndActifTrue (pas findByMunicipaliteldAndActifTrue)
        return valeurVenaleRepository
                .findByMunicipaliteIdAndActifTrueOrderByZoneAsc(user.getMunicipalite().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Ajoute une nouvelle valeur vénale
     */
    @Transactional
    public ValeurVenaleResponse ajouterValeurVenale(ValeurVenaleRequest request) {
        User user = getCurrentUser();

        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée à votre compte");
        }

        // Vérifier si la zone existe déjà
        if (valeurVenaleRepository.existsByZone(request.getZone())) {
            throw new RuntimeException("Une valeur vénale avec cette zone existe déjà");
        }

        ValeurVenale valeurVenale = new ValeurVenale();
        valeurVenale.setZone(request.getZone());
        valeurVenale.setValeurVenaleM2(request.getValeurVenaleM2());  // ✅ getValeurVenaleM2()
        valeurVenale.setDescription(request.getDescription());        // ✅ getDescription()
        valeurVenale.setMunicipalite(user.getMunicipalite());         // ✅ setMunicipalite()
        valeurVenale.setActif(request.getActif() != null ? request.getActif() : true);  // ✅ getActif()

        valeurVenale = valeurVenaleRepository.save(valeurVenale);
        log.info("Valeur vénale ajoutée: {} - {} DT/m²", request.getZone(), request.getValeurVenaleM2());

        return mapToResponse(valeurVenale);
    }

    /**
     * Modifie une valeur vénale existante
     */
    @Transactional
    public ValeurVenaleResponse modifierValeurVenale(Long id, ValeurVenaleRequest request) {
        User user = getCurrentUser();

        ValeurVenale valeurVenale = valeurVenaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Valeur vénale non trouvée"));

        // Vérifier l'accès
        if (!valeurVenale.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        // Vérifier si la zone existe déjà (pour un autre enregistrement)
        valeurVenaleRepository.findByZone(request.getZone())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Une valeur vénale avec cette zone existe déjà");
                    }
                });

        valeurVenale.setZone(request.getZone());
        valeurVenale.setValeurVenaleM2(request.getValeurVenaleM2());  // ✅ getValeurVenaleM2()
        valeurVenale.setDescription(request.getDescription());        // ✅ getDescription()
        valeurVenale.setActif(request.getActif() != null ? request.getActif() : true);  // ✅ getActif()

        valeurVenale = valeurVenaleRepository.save(valeurVenale);
        log.info("Valeur vénale modifiée: ID {}", id);

        return mapToResponse(valeurVenale);
    }

    /**
     * Supprime une valeur vénale (suppression physique)
     */
    @Transactional
    public void supprimerValeurVenale(Long id) {
        User user = getCurrentUser();

        ValeurVenale valeurVenale = valeurVenaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Valeur vénale non trouvée"));

        if (!valeurVenale.getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        valeurVenaleRepository.deleteById(id);
        log.info("Valeur vénale supprimée: ID {}", id);
    }

    /**
     * Mapping vers le DTO de réponse
     */
    private ValeurVenaleResponse mapToResponse(ValeurVenale valeurVenale) {
        ValeurVenaleResponse response = new ValeurVenaleResponse();
        response.setId(valeurVenale.getId());
        response.setZone(valeurVenale.getZone());
        response.setValeurVenaleM2(valeurVenale.getValeurVenaleM2());  // ✅ getValeurVenaleM2()
        response.setDescription(valeurVenale.getDescription());        // ✅ getDescription()
        response.setActif(valeurVenale.getActif());                   // ✅ getActif()
        response.setMunicipaliteNom(valeurVenale.getMunicipalite() != null ?
                valeurVenale.getMunicipalite().getNom() : null);
        return response;
    }
}