// CategorieTIBRepository.java - Version corrigée
package com.municipal.auth.repository;

import com.municipal.auth.entity.CategorieTIB;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategorieTIBRepository extends JpaRepository<CategorieTIB, Long> {

    // ✅ Méthode corrigée: findByMunicipaliteIdAndActifTrueOrderByLibelleAsc
    List<CategorieTIB> findByMunicipaliteIdAndActifTrueOrderByLibelleAsc(Long municipaliteId);

    // ✅ Méthode pour récupérer les catégories actives sans tri spécifique
    List<CategorieTIB> findByActifTrueOrderByLibelleAsc();

    // ✅ Recherche par code
    Optional<CategorieTIB> findByCode(String code);

    // ✅ Vérifier si un code existe
    boolean existsByCode(String code);

    // ✅ Vérifier si un code existe dans une municipalité spécifique
    boolean existsByCodeAndMunicipaliteId(String code, Long municipaliteId);

    // ✅ Recherche par municipalité et actif
    List<CategorieTIB> findByMunicipaliteIdAndActifTrue(Long municipaliteId);
}