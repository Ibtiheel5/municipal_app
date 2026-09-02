// SecteurRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.Secteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecteurRepository extends JpaRepository<Secteur, Long> {

    // Vérifier si un secteur existe avec un nom donné dans une municipalité
    boolean existsByNomAndMunicipaliteId(String nom, Long municipaliteId);

    // Trouver tous les secteurs d'une municipalité
    List<Secteur> findByMunicipaliteId(Long municipaliteId);

    // Trouver un secteur par son nom et sa municipalité
    Optional<Secteur> findByNomAndMunicipaliteId(String nom, Long municipaliteId);

    // Compter les secteurs d'une municipalité
    long countByMunicipaliteId(Long municipaliteId);
}