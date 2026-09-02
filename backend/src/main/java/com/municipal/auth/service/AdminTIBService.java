// AdminTIBService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.CategorieTIBRequest;
import com.municipal.auth.dto.request.ParametreTIBRequest;
import com.municipal.auth.dto.request.ValeurVenaleRequest;
import com.municipal.auth.dto.response.CategorieTIBResponse;
import com.municipal.auth.dto.response.ParametreTIBResponse;
import com.municipal.auth.dto.response.ValeurVenaleResponse;
import com.municipal.auth.entity.CategorieTIB;
import com.municipal.auth.entity.ParametreTIB;
import com.municipal.auth.entity.ValeurVenale;
import com.municipal.auth.repository.CategorieTIBRepository;
import com.municipal.auth.repository.ParametreTIBRepository;
import com.municipal.auth.repository.ValeurVenaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Page Administration > Paramètres TIB
 * - Catégories TIB (CRUD)
 * - Valeurs vénales par zone (CRUD)
 * - Paramètres globaux (frais administratifs, coefficient, délai de paiement)
 */
@Service
@RequiredArgsConstructor
public class AdminTIBService {

    private final CategorieTIBRepository categorieTIBRepository;
    private final ValeurVenaleRepository valeurVenaleRepository;
    private final ParametreTIBRepository parametreTIBRepository;

    // ── Catégories TIB ───────────────────────────────────────────

    public List<CategorieTIBResponse> getCategories() {
        return categorieTIBRepository.findAll().stream()
                .map(this::mapCategorie)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategorieTIBResponse creerCategorie(CategorieTIBRequest request) {
        if (categorieTIBRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Ce code de catégorie existe déjà.");
        }
        CategorieTIB categorie = new CategorieTIB();
        categorie.setCode(request.getCode());
        categorie.setLibelle(request.getLibelle());
        categorie.setPrixReferenceM2(request.getPrixReferenceM2());
        categorie.setActif(request.getActif() == null || request.getActif());
        return mapCategorie(categorieTIBRepository.save(categorie));
    }

    @Transactional
    public CategorieTIBResponse modifierCategorie(Long id, CategorieTIBRequest request) {
        CategorieTIB categorie = categorieTIBRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        categorie.setCode(request.getCode());
        categorie.setLibelle(request.getLibelle());
        categorie.setPrixReferenceM2(request.getPrixReferenceM2());
        if (request.getActif() != null) {
            categorie.setActif(request.getActif());
        }
        return mapCategorie(categorieTIBRepository.save(categorie));
    }

    @Transactional
    public void supprimerCategorie(Long id) {
        if (!categorieTIBRepository.existsById(id)) {
            throw new RuntimeException("Catégorie non trouvée");
        }
        // Suppression logique préférée pour ne pas casser l'historique des avis déjà émis
        CategorieTIB categorie = categorieTIBRepository.findById(id).get();
        categorie.setActif(false);
        categorieTIBRepository.save(categorie);
    }

    // ── Valeurs vénales ──────────────────────────────────────────

    public List<ValeurVenaleResponse> getValeursVenales() {
        return valeurVenaleRepository.findAllByOrderByZoneAsc().stream()
                .map(this::mapValeurVenale)
                .collect(Collectors.toList());
    }

    @Transactional
    public ValeurVenaleResponse creerValeurVenale(ValeurVenaleRequest request) {
        if (valeurVenaleRepository.existsByZone(request.getZone())) {
            throw new RuntimeException("Cette zone existe déjà.");
        }
        ValeurVenale valeurVenale = new ValeurVenale();
        valeurVenale.setZone(request.getZone());
        valeurVenale.setValeurVenaleM2(request.getValeurVenaleM2());
        return mapValeurVenale(valeurVenaleRepository.save(valeurVenale));
    }

    @Transactional
    public ValeurVenaleResponse modifierValeurVenale(Long id, ValeurVenaleRequest request) {
        ValeurVenale valeurVenale = valeurVenaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Valeur vénale non trouvée"));
        valeurVenale.setZone(request.getZone());
        valeurVenale.setValeurVenaleM2(request.getValeurVenaleM2());
        return mapValeurVenale(valeurVenaleRepository.save(valeurVenale));
    }

    @Transactional
    public void supprimerValeurVenale(Long id) {
        if (!valeurVenaleRepository.existsById(id)) {
            throw new RuntimeException("Valeur vénale non trouvée");
        }
        valeurVenaleRepository.deleteById(id);
    }

    // ── Paramètres globaux ───────────────────────────────────────

    public ParametreTIBResponse getParametres() {
        return mapParametre(getOrCreateParametre());
    }

    @Transactional
    public ParametreTIBResponse modifierParametres(ParametreTIBRequest request) {
        ParametreTIB parametre = getOrCreateParametre();
        if (request.getFraisAdministratifs() != null) {
            parametre.setFraisAdministratifs(request.getFraisAdministratifs());
        }
        if (request.getCoefficientTIB() != null) {
            parametre.setCoefficientTIB(request.getCoefficientTIB());
        }
        if (request.getDelaiPaiementJours() != null) {
            parametre.setDelaiPaiementJours(request.getDelaiPaiementJours());
        }
        return mapParametre(parametreTIBRepository.save(parametre));
    }

    /** Utilisé par TIBGestionService pour récupérer la config courante. */
    public ParametreTIB getOrCreateParametre() {
        return parametreTIBRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> parametreTIBRepository.save(new ParametreTIB()));
    }

    // ── Mappers ──────────────────────────────────────────────────

    private CategorieTIBResponse mapCategorie(CategorieTIB c) {
        CategorieTIBResponse r = new CategorieTIBResponse();
        r.setId(c.getId());
        r.setCode(c.getCode());
        r.setLibelle(c.getLibelle());
        r.setPrixReferenceM2(c.getPrixReferenceM2());
        r.setActif(c.getActif());
        return r;
    }

    private ValeurVenaleResponse mapValeurVenale(ValeurVenale v) {
        ValeurVenaleResponse r = new ValeurVenaleResponse();
        r.setId(v.getId());
        r.setZone(v.getZone());
        r.setValeurVenaleM2(v.getValeurVenaleM2());
        return r;
    }

    private ParametreTIBResponse mapParametre(ParametreTIB p) {
        ParametreTIBResponse r = new ParametreTIBResponse();
        r.setId(p.getId());
        r.setFraisAdministratifs(p.getFraisAdministratifs());
        r.setCoefficientTIB(p.getCoefficientTIB());
        r.setDelaiPaiementJours(p.getDelaiPaiementJours());
        return r;
    }
}
