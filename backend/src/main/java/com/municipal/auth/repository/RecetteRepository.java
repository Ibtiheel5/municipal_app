// RecetteRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.Recette;
import com.municipal.auth.entity.TypeRecette;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecetteRepository extends JpaRepository<Recette, Long>, JpaSpecificationExecutor<Recette> {

    /** Clé canonique : un bien n'a qu'une seule recette par (type, année). */
    Optional<Recette> findByBienIdAndTypeAndAnneeFiscale(Long bienId, TypeRecette type, Integer anneeFiscale);

    List<Recette> findByBienIdAndTypeOrderByAnneeFiscaleAsc(Long bienId, TypeRecette type);

    /** Point d'entrée du relevé de compte : recherche par code recette, numéro d'avis OU Code TIB/TNB. */
    Optional<Recette> findFirstByCodeRecetteOrNumeroAvisOrCodeTaxe(String codeRecette, String numeroAvis, String codeTaxe);

    long countByMunicipaliteId(Long municipaliteId);

    @Query("SELECT MAX(r.id) FROM Recette r")
    Long findMaxId();
}