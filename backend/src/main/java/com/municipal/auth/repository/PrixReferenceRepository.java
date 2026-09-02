// PrixReferenceRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.PrixReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrixReferenceRepository extends JpaRepository<PrixReference, Long> {

    Optional<PrixReference> findByAnneeFiscaleAndTypeBienAndMunicipaliteId(
            Integer anneeFiscale, String typeBien, Long municipaliteId);

    List<PrixReference> findByMunicipaliteId(Long municipaliteId);

    @Query("SELECT DISTINCT p.anneeFiscale FROM PrixReference p WHERE p.municipalite.id = :municipaliteId ORDER BY p.anneeFiscale DESC")
    List<Integer> findAnneesFiscalesByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);

    @Query("SELECT DISTINCT p.typeBien FROM PrixReference p WHERE p.municipalite.id = :municipaliteId")
    List<String> findTypesBienByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);

    boolean existsByAnneeFiscaleAndTypeBienAndMunicipaliteId(
            Integer anneeFiscale, String typeBien, Long municipaliteId);
}