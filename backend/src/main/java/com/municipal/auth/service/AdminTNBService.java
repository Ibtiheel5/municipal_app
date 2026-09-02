// AdminTNBService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.DensiteUrbaineRequest;
import com.municipal.auth.dto.request.ValeurVenaleTNBRequest;
import com.municipal.auth.dto.response.DensiteUrbaineResponse;
import com.municipal.auth.dto.response.ValeurVenaleTNBResponse;
import com.municipal.auth.entity.DensiteUrbaine;
import com.municipal.auth.entity.ValeurVenaleTNB;
import com.municipal.auth.repository.DensiteUrbaineRepository;
import com.municipal.auth.repository.ValeurVenaleTNBRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Page Administration > Paramètres TNB
 * - Densités urbaines (CRUD) : catégorie + prix densité (TND/m²)
 * - Valeurs vénales (CRUD) : référentiel valeur VN / année / description
 */
@Service
@RequiredArgsConstructor
public class AdminTNBService {

    private final DensiteUrbaineRepository densiteUrbaineRepository;
    private final ValeurVenaleTNBRepository valeurVenaleTNBRepository;

    // ── Densités urbaines ────────────────────────────────────────

    public List<DensiteUrbaineResponse> getDensites() {
        return densiteUrbaineRepository.findAllByOrderByPrixDensiteDesc().stream()
                .map(this::mapDensite)
                .collect(Collectors.toList());
    }

    public List<DensiteUrbaineResponse> getDensitesActives() {
        return densiteUrbaineRepository.findByActifTrueOrderByPrixDensiteDesc().stream()
                .map(this::mapDensite)
                .collect(Collectors.toList());
    }

    @Transactional
    public DensiteUrbaineResponse creerDensite(DensiteUrbaineRequest request) {
        DensiteUrbaine densite = new DensiteUrbaine();
        densite.setCategorie(request.getCategorie());
        densite.setPrixDensite(request.getPrixDensite());
        densite.setActif(request.getActif() == null || request.getActif());
        return mapDensite(densiteUrbaineRepository.save(densite));
    }

    @Transactional
    public DensiteUrbaineResponse modifierDensite(Long id, DensiteUrbaineRequest request) {
        DensiteUrbaine densite = densiteUrbaineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie de densité non trouvée"));
        densite.setCategorie(request.getCategorie());
        densite.setPrixDensite(request.getPrixDensite());
        if (request.getActif() != null) {
            densite.setActif(request.getActif());
        }
        return mapDensite(densiteUrbaineRepository.save(densite));
    }

    @Transactional
    public void supprimerDensite(Long id) {
        if (!densiteUrbaineRepository.existsById(id)) {
            throw new RuntimeException("Catégorie de densité non trouvée");
        }
        densiteUrbaineRepository.deleteById(id);
    }

    // ── Valeurs vénales (référentiel) ────────────────────────────

    public List<ValeurVenaleTNBResponse> getValeursVenales() {
        return valeurVenaleTNBRepository.findAllByOrderByAnneeDesc().stream()
                .map(this::mapValeurVenale)
                .collect(Collectors.toList());
    }

    @Transactional
    public ValeurVenaleTNBResponse creerValeurVenale(ValeurVenaleTNBRequest request) {
        ValeurVenaleTNB v = new ValeurVenaleTNB();
        v.setValeurVn(request.getValeurVn());
        v.setAnnee(request.getAnnee());
        v.setDescription(request.getDescription());
        return mapValeurVenale(valeurVenaleTNBRepository.save(v));
    }

    @Transactional
    public ValeurVenaleTNBResponse modifierValeurVenale(Long id, ValeurVenaleTNBRequest request) {
        ValeurVenaleTNB v = valeurVenaleTNBRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Valeur vénale non trouvée"));
        v.setValeurVn(request.getValeurVn());
        v.setAnnee(request.getAnnee());
        v.setDescription(request.getDescription());
        return mapValeurVenale(valeurVenaleTNBRepository.save(v));
    }

    @Transactional
    public void supprimerValeurVenale(Long id) {
        if (!valeurVenaleTNBRepository.existsById(id)) {
            throw new RuntimeException("Valeur vénale non trouvée");
        }
        valeurVenaleTNBRepository.deleteById(id);
    }

    // ── Mappers ──────────────────────────────────────────────────

    private DensiteUrbaineResponse mapDensite(DensiteUrbaine d) {
        DensiteUrbaineResponse r = new DensiteUrbaineResponse();
        r.setId(d.getId());
        r.setCategorie(d.getCategorie());
        r.setPrixDensite(d.getPrixDensite());
        r.setActif(d.getActif());
        return r;
    }

    private ValeurVenaleTNBResponse mapValeurVenale(ValeurVenaleTNB v) {
        ValeurVenaleTNBResponse r = new ValeurVenaleTNBResponse();
        r.setId(v.getId());
        r.setValeurVn(v.getValeurVn());
        r.setAnnee(v.getAnnee());
        r.setDescription(v.getDescription());
        return r;
    }
}
