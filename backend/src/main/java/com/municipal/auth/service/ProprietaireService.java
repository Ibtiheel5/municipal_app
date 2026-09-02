// ProprietaireService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.ProprietaireRequest;
import com.municipal.auth.dto.response.ProprietaireResponse;
import com.municipal.auth.dto.response.ProprietaireListResponse;
import com.municipal.auth.dto.response.BienImmobilierResponse;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProprietaireService {

    private final ProprietaireRepository proprietaireRepository;
    private final RueRepository rueRepository;
    private final UserRepository userRepository;
    private final BienImmobilierRepository bienImmobilierRepository;

    public ProprietaireService(ProprietaireRepository proprietaireRepository,
                               RueRepository rueRepository,
                               UserRepository userRepository,
                               BienImmobilierRepository bienImmobilierRepository) {
        this.proprietaireRepository = proprietaireRepository;
        this.rueRepository = rueRepository;
        this.userRepository = userRepository;
        this.bienImmobilierRepository = bienImmobilierRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Transactional
    public ProprietaireResponse create(ProprietaireRequest request) {
        // Logs pour déboguer
        System.out.println("=== CRÉATION PROPRIÉTAIRE ===");
        System.out.println("CIN: " + request.getCin());
        System.out.println("Nom: " + request.getNom());
        System.out.println("Prénom: " + request.getPrenom());
        System.out.println("Date naissance: " + request.getDateNaissance());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Adresse: " + request.getAdresse());
        System.out.println("Superficie: " + request.getSuperficie());
        System.out.println("Type bien: " + request.getTypeBien());
        System.out.println("Rue ID: " + request.getRueId());

        User user = getCurrentUser();
        if (user.getMunicipalite() == null) {
            throw new RuntimeException("Aucune municipalité affectée");
        }

        if (proprietaireRepository.findByCin(request.getCin()).isPresent()) {
            throw new RuntimeException("Un propriétaire avec ce CIN existe déjà");
        }

        Rue rue = rueRepository.findById(request.getRueId())
                .orElseThrow(() -> new RuntimeException("Rue non trouvée"));

        if (!rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé à cette rue");
        }

        // Création du propriétaire
        Proprietaire proprietaire = new Proprietaire();
        proprietaire.setCin(request.getCin());
        proprietaire.setNom(request.getNom());
        proprietaire.setPrenom(request.getPrenom());
        proprietaire.setDateNaissance(request.getDateNaissance());
        proprietaire.setTelephone(request.getTelephone());
        proprietaire.setEmail(request.getEmail());
        proprietaire.setAdresse(request.getAdresse());
        proprietaire.setNumeroBien(request.getNumeroBien());
        proprietaire.setSuperficie(request.getSuperficie());
        proprietaire.setTypeBien(request.getTypeBien());
        proprietaire.setObservations(request.getObservations());
        proprietaire.setRue(rue);

        proprietaire = proprietaireRepository.save(proprietaire);
        System.out.println("✅ Propriétaire créé avec ID: " + proprietaire.getId());

        // Création du bien immobilier associé avec la colonne 'taxitib'
        BienImmobilier bien = new BienImmobilier();
        bien.setAdresse(request.getAdresse());
        bien.setSuperficie(request.getSuperficie());
        bien.setTypeBien(request.getTypeBien());
        // S'assurer que le taux n'est pas null
        bien.setTauxTIB(rue.getTaux() != null ? rue.getTaux() : 0.08);
        bien.setProprietaire(proprietaire);
        bien.setRue(rue);

        bien = bienImmobilierRepository.save(bien);
        System.out.println("✅ Bien immobilier créé avec ID: " + bien.getId());

        return mapToResponse(proprietaire);
    }

    @Transactional
    public ProprietaireResponse update(Long id, ProprietaireRequest request) {
        System.out.println("=== MODIFICATION PROPRIÉTAIRE ===");
        System.out.println("ID: " + id);
        System.out.println("CIN: " + request.getCin());
        System.out.println("Nom: " + request.getNom());
        System.out.println("Prénom: " + request.getPrenom());
        System.out.println("Date naissance: " + request.getDateNaissance());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Adresse: " + request.getAdresse());
        System.out.println("Superficie: " + request.getSuperficie());
        System.out.println("Type bien: " + request.getTypeBien());
        System.out.println("Rue ID: " + request.getRueId());

        User user = getCurrentUser();
        Proprietaire proprietaire = proprietaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));

        if (!proprietaire.getRue().getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        proprietaireRepository.findByCin(request.getCin())
                .ifPresent(p -> {
                    if (!p.getId().equals(id)) {
                        throw new RuntimeException("Un propriétaire avec ce CIN existe déjà");
                    }
                });

        Rue rue = rueRepository.findById(request.getRueId())
                .orElseThrow(() -> new RuntimeException("Rue non trouvée"));

        // Mise à jour du propriétaire
        proprietaire.setCin(request.getCin());
        proprietaire.setNom(request.getNom());
        proprietaire.setPrenom(request.getPrenom());
        proprietaire.setDateNaissance(request.getDateNaissance());
        proprietaire.setTelephone(request.getTelephone());
        proprietaire.setEmail(request.getEmail());
        proprietaire.setAdresse(request.getAdresse());
        proprietaire.setNumeroBien(request.getNumeroBien());
        proprietaire.setSuperficie(request.getSuperficie());
        proprietaire.setTypeBien(request.getTypeBien());
        proprietaire.setObservations(request.getObservations());
        proprietaire.setRue(rue);

        proprietaire = proprietaireRepository.save(proprietaire);
        System.out.println("✅ Propriétaire modifié avec ID: " + proprietaire.getId());

        // Mise à jour ou création du bien immobilier
        List<BienImmobilier> biens = bienImmobilierRepository.findByProprietaireId(id);
        BienImmobilier bien;

        if (biens != null && !biens.isEmpty()) {
            bien = biens.get(0);
            bien.setAdresse(request.getAdresse());
            bien.setSuperficie(request.getSuperficie());
            bien.setTypeBien(request.getTypeBien());
            bien.setTauxTIB(rue.getTaux() != null ? rue.getTaux() : 0.08);
            bien.setRue(rue);
            System.out.println("✅ Bien immobilier mis à jour");
        } else {
            bien = new BienImmobilier();
            bien.setAdresse(request.getAdresse());
            bien.setSuperficie(request.getSuperficie());
            bien.setTypeBien(request.getTypeBien());
            bien.setTauxTIB(rue.getTaux() != null ? rue.getTaux() : 0.08);
            bien.setProprietaire(proprietaire);
            bien.setRue(rue);
            System.out.println("✅ Nouveau bien immobilier créé");
        }

        bienImmobilierRepository.save(bien);

        return mapToResponse(proprietaire);
    }

    @Transactional
    public void delete(Long id) {
        System.out.println("=== SUPPRESSION PROPRIÉTAIRE ===");
        System.out.println("ID: " + id);

        User user = getCurrentUser();
        Proprietaire proprietaire = proprietaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));

        if (!proprietaire.getRue().getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        // Supprimer d'abord les biens associés
        List<BienImmobilier> biens = bienImmobilierRepository.findByProprietaireId(id);
        if (biens != null && !biens.isEmpty()) {
            bienImmobilierRepository.deleteAll(biens);
            System.out.println("✅ " + biens.size() + " bien(s) immobilier(s) supprimé(s)");
        }

        proprietaireRepository.deleteById(id);
        System.out.println("✅ Propriétaire supprimé");
    }

    public ProprietaireResponse getById(Long id) {
        System.out.println("=== RÉCUPÉRATION PROPRIÉTAIRE ===");
        System.out.println("ID: " + id);

        Proprietaire proprietaire = proprietaireRepository.findByIdWithBiens(id)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé"));
        return mapToResponse(proprietaire);
    }

    public Page<ProprietaireListResponse> getAll(Pageable pageable, String search, Long rueId, Long municipaliteId) {
        User user = getCurrentUser();
        Long userMunicipaliteId = user.getMunicipalite().getId();

        Page<Proprietaire> page;

        if (search != null && !search.isEmpty()) {
            page = proprietaireRepository.findBySearchAndMunicipalite(search, userMunicipaliteId, pageable);
        } else if (rueId != null) {
            page = proprietaireRepository.findByRueIdAndMunicipalite(rueId, userMunicipaliteId, pageable);
        } else if (municipaliteId != null) {
            page = proprietaireRepository.findByMunicipaliteId(municipaliteId, pageable);
        } else {
            page = proprietaireRepository.findByMunicipaliteId(userMunicipaliteId, pageable);
        }

        return page.map(this::mapToListResponse);
    }

    public List<ProprietaireResponse> search(String cin, String nom) {
        User user = getCurrentUser();
        Long municipaliteId = user.getMunicipalite().getId();

        List<Proprietaire> proprietaires;
        if (cin != null && !cin.isEmpty()) {
            proprietaires = proprietaireRepository.findByCinContainingAndMunicipaliteId(cin, municipaliteId);
        } else if (nom != null && !nom.isEmpty()) {
            proprietaires = proprietaireRepository.findByNomContainingAndMunicipaliteId(nom, municipaliteId);
        } else {
            proprietaires = proprietaireRepository.findByMunicipaliteId(municipaliteId);
        }

        return proprietaires.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProprietaireResponse> getByRue(Long rueId) {
        User user = getCurrentUser();
        Rue rue = rueRepository.findById(rueId)
                .orElseThrow(() -> new RuntimeException("Rue non trouvée"));

        if (!rue.getSecteur().getMunicipalite().getId().equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        return proprietaireRepository.findByRueId(rueId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProprietaireResponse> getByMunicipalite(Long municipaliteId) {
        User user = getCurrentUser();
        if (!municipaliteId.equals(user.getMunicipalite().getId())) {
            throw new RuntimeException("Accès refusé");
        }

        return proprietaireRepository.findByMunicipaliteId(municipaliteId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long count() {
        User user = getCurrentUser();
        return proprietaireRepository.countByMunicipaliteId(user.getMunicipalite().getId());
    }

    private ProprietaireResponse mapToResponse(Proprietaire proprietaire) {
        ProprietaireResponse response = new ProprietaireResponse();
        response.setId(proprietaire.getId());
        response.setCin(proprietaire.getCin());
        response.setNom(proprietaire.getNom());
        response.setPrenom(proprietaire.getPrenom());
        response.setDateNaissance(proprietaire.getDateNaissance());
        response.setTelephone(proprietaire.getTelephone());
        response.setEmail(proprietaire.getEmail());
        response.setAdresse(proprietaire.getAdresse());
        response.setNumeroBien(proprietaire.getNumeroBien());
        response.setSuperficie(proprietaire.getSuperficie());
        response.setTypeBien(proprietaire.getTypeBien());
        response.setObservations(proprietaire.getObservations());
        response.setRueId(proprietaire.getRue().getId());
        response.setRueNom(proprietaire.getRue().getNom());
        response.setSecteurNom(proprietaire.getRue().getSecteur().getNom());
        response.setMunicipaliteNom(proprietaire.getRue().getSecteur().getMunicipalite().getNom());
        response.setTauxTIB(proprietaire.getRue().getTaux());

        List<BienImmobilier> biens = proprietaire.getBiens();
        if (biens != null && !biens.isEmpty()) {
            response.setNbBiens(biens.size());
            response.setBiens(biens.stream()
                    .map(this::mapToBienResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setNbBiens(0);
            response.setBiens(null);
        }

        return response;
    }

    private BienImmobilierResponse mapToBienResponse(BienImmobilier bien) {
        BienImmobilierResponse response = new BienImmobilierResponse();
        response.setId(bien.getId());
        response.setAdresse(bien.getAdresse());
        response.setSuperficie(bien.getSuperficie());
        response.setTypeBien(bien.getTypeBien());
        response.setTauxTIB(bien.getTauxTIB());
        response.setRueNom(bien.getRue().getNom());
        response.setSecteurNom(bien.getRue().getSecteur().getNom());
        return response;
    }

    private ProprietaireListResponse mapToListResponse(Proprietaire proprietaire) {
        ProprietaireListResponse response = new ProprietaireListResponse();
        response.setId(proprietaire.getId());
        response.setCin(proprietaire.getCin());
        response.setNom(proprietaire.getNom());
        response.setPrenom(proprietaire.getPrenom());
        response.setTelephone(proprietaire.getTelephone());
        response.setAdresse(proprietaire.getAdresse());
        response.setTypeBien(proprietaire.getTypeBien());
        response.setSuperficie(proprietaire.getSuperficie());
        response.setRueNom(proprietaire.getRue().getNom());
        response.setSecteurNom(proprietaire.getRue().getSecteur().getNom());
        return response;
    }
}