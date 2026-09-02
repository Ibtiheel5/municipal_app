// BienImmobilierRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.BienImmobilier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BienImmobilierRepository extends JpaRepository<BienImmobilier, Long> {

    List<BienImmobilier> findByProprietaireId(Long proprietaireId);

    List<BienImmobilier> findByRueId(Long rueId);

    @Query("SELECT b FROM BienImmobilier b WHERE b.rue.secteur.municipalite.id = :municipaliteId")
    List<BienImmobilier> findByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);
}