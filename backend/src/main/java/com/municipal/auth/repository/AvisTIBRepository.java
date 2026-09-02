// AvisTIBRepository.java - Version corrigée
package com.municipal.auth.repository;

import com.municipal.auth.entity.AvisTIB;
import com.municipal.auth.entity.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvisTIBRepository extends JpaRepository<AvisTIB, Long> {

    // ✅ Méthode existante - récupère les avis d'un propriétaire
    List<AvisTIB> findByProprietaireIdOrderByDateCreationEnrDesc(Long proprietaireId);

    // ✅ NOUVELLE MÉTHODE - récupère les avis d'un propriétaire pour une année fiscale
    @Query("SELECT a FROM AvisTIB a WHERE a.proprietaire.id = :proprietaireId AND a.anneeFiscale = :anneeFiscale")
    List<AvisTIB> findByProprietaireIdAndAnneeFiscale(
            @Param("proprietaireId") Long proprietaireId,
            @Param("anneeFiscale") Integer anneeFiscale);

    // ✅ Méthode pour compter les avis par année fiscale
    @Query("SELECT COUNT(a) FROM AvisTIB a WHERE a.anneeFiscale = :anneeFiscale")
    long countByAnneeFiscale(@Param("anneeFiscale") Integer anneeFiscale);

    // ✅ Méthode de recherche avec filtres
    @Query("""
        SELECT a FROM AvisTIB a
        WHERE a.rue.secteur.municipalite.id = :municipaliteId
          AND (:annee IS NULL OR a.anneeFiscale = :annee)
          AND (:rueId IS NULL OR a.rue.id = :rueId)
          AND (:proprietaireId IS NULL OR a.proprietaire.id = :proprietaireId)
          AND (:statut IS NULL OR a.statut = :statut)
        ORDER BY a.dateCreationEnr DESC
        """)


    List<AvisTIB> rechercher(
            @Param("municipaliteId") Long municipaliteId,
            @Param("annee") Integer annee,
            @Param("rueId") Long rueId,
            @Param("proprietaireId") Long proprietaireId,
            @Param("statut") StatutPaiement statut
    );

    Optional<AvisTIB> findByCodeTib(String codeTib);

    @Query("SELECT a FROM AvisTIB a WHERE a.proprietaire.id = :proprietaireId AND a.bien.id = :bienId ORDER BY a.anneeFiscale ASC")
    List<AvisTIB> findByProprietaireIdAndBienIdOrderByAnneeFiscaleAsc(
            @Param("proprietaireId") Long proprietaireId,
            @Param("bienId") Long bienId);
}