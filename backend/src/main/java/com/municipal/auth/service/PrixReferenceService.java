// PrixReferenceService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.response.PrixReferenceResponse;
import com.municipal.auth.entity.PrixReference;
import com.municipal.auth.entity.User;
import com.municipal.auth.repository.PrixReferenceRepository;
import com.municipal.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrixReferenceService {

    private final PrixReferenceRepository prixReferenceRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithMunicipalite(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Récupère tous les prix de référence de la municipalité de l'utilisateur
     */
    public List<PrixReferenceResponse> getPrixReferences() {
        User user = getCurrentUser();
        return prixReferenceRepository.findByMunicipaliteId(user.getMunicipalite().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les années fiscales disponibles pour une municipalité
     */
    public List<Integer> getAnneesFiscales() {
        User user = getCurrentUser();
        return prixReferenceRepository.findAnneesFiscalesByMunicipaliteId(user.getMunicipalite().getId());
    }

    /**
     * Récupère les types de biens disponibles pour une municipalité
     */
    public List<String> getTypesBien() {
        User user = getCurrentUser();
        return prixReferenceRepository.findTypesBienByMunicipaliteId(user.getMunicipalite().getId());
    }

    /**
     * Récupère le prix de référence pour une année, un type de bien et une municipalité
     */
    public Double getPrixReference(Integer anneeFiscale, String typeBien) {
        User user = getCurrentUser();
        return prixReferenceRepository
                .findByAnneeFiscaleAndTypeBienAndMunicipaliteId(
                        anneeFiscale,
                        typeBien,
                        user.getMunicipalite().getId())
                .map(PrixReference::getPrixM2)
                .orElse(null);
    }

    /**
     * Calcule le montant TIB avec le prix de référence
     */
    public Double calculerMontantTIB(Integer anneeFiscale, String typeBien, Double superficie, Double taux) {
        Double prixRef = getPrixReference(anneeFiscale, typeBien);
        if (prixRef == null) {
            throw new RuntimeException("Aucun prix de référence trouvé pour l'année " + anneeFiscale +
                    " et le type " + typeBien);
        }
        return prixRef * superficie * 0.02 * taux;
    }

    private PrixReferenceResponse mapToResponse(PrixReference prixRef) {
        PrixReferenceResponse response = new PrixReferenceResponse();
        response.setId(prixRef.getId());
        response.setAnneeFiscale(prixRef.getAnneeFiscale());
        response.setTypeBien(prixRef.getTypeBien());
        response.setPrixM2(prixRef.getPrixM2());
        response.setMunicipaliteNom(prixRef.getMunicipalite().getNom());
        response.setDateCreation(prixRef.getDateCreation());
        response.setDateModification(prixRef.getDateModification());
        return response;
    }
}