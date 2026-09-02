// ProprietaireRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.Proprietaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProprietaireRepository extends JpaRepository<Proprietaire, Long> {

    Optional<Proprietaire> findByCin(String cin);

    List<Proprietaire> findByRueId(Long rueId);

    long countByRueId(Long rueId);

    @Query("SELECT p FROM Proprietaire p WHERE p.rue.secteur.municipalite.id = :municipaliteId")
    List<Proprietaire> findByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);

    @Query("SELECT p FROM Proprietaire p WHERE p.cin LIKE %:cin% AND p.rue.secteur.municipalite.id = :municipaliteId")
    List<Proprietaire> findByCinContainingAndMunicipaliteId(@Param("cin") String cin, @Param("municipaliteId") Long municipaliteId);

    @Query("SELECT p FROM Proprietaire p WHERE p.nom LIKE %:nom% AND p.rue.secteur.municipalite.id = :municipaliteId")
    List<Proprietaire> findByNomContainingAndMunicipaliteId(@Param("nom") String nom, @Param("municipaliteId") Long municipaliteId);

    @Query("SELECT p FROM Proprietaire p WHERE p.rue.secteur.municipalite.id = :municipaliteId")
    Page<Proprietaire> findByMunicipaliteId(@Param("municipaliteId") Long municipaliteId, Pageable pageable);

    @Query("SELECT p FROM Proprietaire p WHERE p.rue.id = :rueId AND p.rue.secteur.municipalite.id = :municipaliteId")
    Page<Proprietaire> findByRueIdAndMunicipalite(@Param("rueId") Long rueId, @Param("municipaliteId") Long municipaliteId, Pageable pageable);

    @Query("SELECT p FROM Proprietaire p WHERE p.rue.secteur.municipalite.id = :municipaliteId AND " +
            "(LOWER(p.cin) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Proprietaire> findBySearchAndMunicipalite(@Param("search") String search, @Param("municipaliteId") Long municipaliteId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Proprietaire p WHERE p.rue.secteur.municipalite.id = :municipaliteId")
    long countByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);

    @Query("SELECT DISTINCT p FROM Proprietaire p " +
            "LEFT JOIN FETCH p.biens b " +
            "LEFT JOIN FETCH p.rue r " +
            "LEFT JOIN FETCH r.secteur s " +
            "LEFT JOIN FETCH s.municipalite m " +
            "WHERE p.id = :id")
    Optional<Proprietaire> findByIdWithBiens(@Param("id") Long id);
}