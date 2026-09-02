// ValeurVenaleRepository.java - Version corrigée
package com.municipal.auth.repository;

import com.municipal.auth.entity.ValeurVenale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ValeurVenaleRepository extends JpaRepository<ValeurVenale, Long> {

    // ✅ Correction: findByMunicipaliteIdAndActifTrue (pas findByMunicipaliteldAndActifTrue)
    List<ValeurVenale> findByMunicipaliteIdAndActifTrueOrderByZoneAsc(Long municipaliteId);

    // ✅ Méthode alternative sans tri
    List<ValeurVenale> findByMunicipaliteIdAndActifTrue(Long municipaliteId);

    // ✅ Recherche par zone
    Optional<ValeurVenale> findByZone(String zone);

    // ✅ Vérifier si une zone existe
    boolean existsByZone(String zone);

    // ✅ Toutes les valeurs vénales triées par zone
    List<ValeurVenale> findAllByOrderByZoneAsc();
}