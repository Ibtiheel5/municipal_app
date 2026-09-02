// AiExportService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.export.*;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service d'export en lecture seule, utilisé exclusivement par AiExportController.
 * Fournit au microservice ai-service (FastAPI) des données aplaties, sans entités
 * JPA ni informations directement identifiantes, pour l'entraînement et l'inférence
 * des modèles (risque de retard, prévision, anomalies, segmentation).
 *
 * ⚠️ Toutes les méthodes sont @Transactional(readOnly = true) : les associations
 * LAZY (rue.secteur, rue.secteur.municipalite...) sont résolues DANS la session,
 * avant le retour du DTO déjà aplati.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiExportService {

    private final RecetteRepository recetteRepository;
    private final PaiementRepository paiementRepository;
    private final ProprietaireRepository proprietaireRepository;
    private final AvisTIBRepository avisTIBRepository;
    private final AvisTNBRepository avisTNBRepository;

    @Transactional(readOnly = true)
    public List<RecetteExportDTO> exportRecettes() {
        return recetteRepository.findAll().stream().map(r -> {
            RecetteExportDTO dto = new RecetteExportDTO();
            dto.setId(r.getId());
            dto.setCodeRecette(r.getCodeRecette());
            dto.setType(r.getType() != null ? r.getType().name() : null);
            dto.setReferenceTaxeId(r.getReferenceTaxeId());
            dto.setNumeroAvis(r.getNumeroAvis());
            dto.setCodeTaxe(r.getCodeTaxe());
            dto.setProprietaireId(r.getProprietaire() != null ? r.getProprietaire().getId() : null);
            dto.setRueId(r.getRue() != null ? r.getRue().getId() : null);
            dto.setBienId(r.getBien() != null ? r.getBien().getId() : null);
            dto.setMunicipaliteId(r.getMunicipaliteId());
            dto.setSecteurNom(safeSecteurNom(r.getRue()));
            dto.setDateDebutImposition(r.getDateDebutImposition());
            dto.setAnneeFiscale(r.getAnneeFiscale());
            dto.setMontant(r.getMontant());
            dto.setMontantPaye(r.getMontantPaye());
            dto.setDateCreation(r.getDateCreation());
            dto.setDateGeneration(r.getDateGeneration());
            dto.setDateLimite(r.getDateLimite());
            dto.setStatut(r.getStatut() != null ? r.getStatut().name() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaiementExportDTO> exportPaiements() {
        return paiementRepository.findAll().stream().map(p -> {
            PaiementExportDTO dto = new PaiementExportDTO();
            dto.setId(p.getId());
            dto.setRecetteId(p.getRecette() != null ? p.getRecette().getId() : null);
            dto.setMontant(p.getMontant());
            dto.setDatePaiement(p.getDatePaiement());
            dto.setModePaiement(p.getModePaiement() != null ? p.getModePaiement().name() : null);
            dto.setNumeroQuittance(p.getNumeroQuittance());
            dto.setAgentNom(p.getAgentNom());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProprietaireExportDTO> exportProprietaires() {
        return proprietaireRepository.findAll().stream().map(p -> {
            ProprietaireExportDTO dto = new ProprietaireExportDTO();
            dto.setId(p.getId());
            dto.setCin(p.getCin());
            dto.setDateNaissance(p.getDateNaissance());
            dto.setSuperficie(p.getSuperficie());
            dto.setTypeBien(p.getTypeBien());
            if (p.getRue() != null) {
                dto.setRueId(p.getRue().getId());
                if (p.getRue().getSecteur() != null) {
                    dto.setSecteurNom(p.getRue().getSecteur().getNom());
                    if (p.getRue().getSecteur().getMunicipalite() != null) {
                        dto.setMunicipaliteId(p.getRue().getSecteur().getMunicipalite().getId());
                        dto.setMunicipaliteNom(p.getRue().getSecteur().getMunicipalite().getNom());
                    }
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvisTIBExportDTO> exportAvisTIB() {
        return avisTIBRepository.findAll().stream().map(a -> {
            AvisTIBExportDTO dto = new AvisTIBExportDTO();
            dto.setId(a.getId());
            dto.setCodeTib(a.getCodeTib());
            dto.setSourceDossier(a.getSourceDossier() != null ? a.getSourceDossier().name() : null);
            dto.setAnneeFiscale(a.getAnneeFiscale());
            dto.setDateCreation(a.getDateCreation());
            dto.setDateDebutImposition(a.getDateDebutImposition());
            dto.setBienId(a.getBien() != null ? a.getBien().getId() : null);
            dto.setProprietaireId(a.getProprietaire() != null ? a.getProprietaire().getId() : null);
            dto.setRueId(a.getRue() != null ? a.getRue().getId() : null);
            dto.setSecteurNom(safeSecteurNom(a.getRue()));
            dto.setCategorieId(a.getCategorie() != null ? a.getCategorie().getId() : null);
            dto.setPrixReferenceM2(a.getPrixReferenceM2());
            dto.setSurface(a.getSurface());
            dto.setTauxRue(a.getTauxRue());
            dto.setCoefficient(a.getCoefficient());
            dto.setMontantTib(a.getMontantTib());
            dto.setFraisAdministratifs(a.getFraisAdministratifs());
            dto.setTaxeTotale(a.getTaxeTotale());
            dto.setNumeroAvis(a.getNumeroAvis());
            dto.setDateAvis(a.getDateAvis());
            dto.setDateLimite(a.getDateLimite());
            dto.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvisTNBExportDTO> exportAvisTNB() {
        return avisTNBRepository.findAll().stream().map(a -> {
            AvisTNBExportDTO dto = new AvisTNBExportDTO();
            dto.setId(a.getId());
            dto.setCodeTnb(a.getCodeTnb());
            dto.setSourceDossier(a.getSourceDossier() != null ? a.getSourceDossier().name() : null);
            dto.setAnneeFiscale(a.getAnneeFiscale());
            dto.setDateCreation(a.getDateCreation());
            dto.setDateDebutImposition(a.getDateDebutImposition());
            dto.setTerrainId(a.getTerrain() != null ? a.getTerrain().getId() : null);
            dto.setProprietaireId(a.getProprietaire() != null ? a.getProprietaire().getId() : null);
            dto.setRueId(a.getRue() != null ? a.getRue().getId() : null);
            dto.setSecteurNom(safeSecteurNom(a.getRue()));
            dto.setMethode(a.getMethode() != null ? a.getMethode().name() : null);
            dto.setValeurVenale(a.getValeurVenale());
            dto.setDensiteId(a.getDensite() != null ? a.getDensite().getId() : null);
            dto.setSurface(a.getSurface());
            dto.setMontantTnb(a.getMontantTnb());
            dto.setNumeroAvis(a.getNumeroAvis());
            dto.setDateAvis(a.getDateAvis());
            dto.setDateLimite(a.getDateLimite());
            dto.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    private String safeSecteurNom(Rue rue) {
        if (rue == null || rue.getSecteur() == null) return null;
        return rue.getSecteur().getNom();
    }
}
