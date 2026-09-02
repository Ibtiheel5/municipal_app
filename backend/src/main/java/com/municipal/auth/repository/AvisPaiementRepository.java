// AvisPaiementRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.AvisPaiement;
import com.municipal.auth.entity.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvisPaiementRepository extends JpaRepository<AvisPaiement, Long> {

    // Trouver les avis par propriétaire (triés par date décroissante)
    List<AvisPaiement> findByProprietaireIdOrderByDateEmissionDesc(Long proprietaireId);

    // Trouver les avis par bien
    List<AvisPaiement> findByBienId(Long bienId);

    // Trouver les avis par statut
    List<AvisPaiement> findByStatut(StatutPaiement statut);

    // Trouver les avis en retard (date limite dépassée et statut EN_ATTENTE)
    @Query("SELECT a FROM AvisPaiement a WHERE a.dateLimite < :date AND a.statut = :statut")
    List<AvisPaiement> findByDateLimiteBeforeAndStatut(@Param("date") LocalDate date, @Param("statut") StatutPaiement statut);

    // Compter le nombre total d'avis
    long count();

    // Trouver les avis d'une municipalité
    @Query("SELECT a FROM AvisPaiement a WHERE a.proprietaire.rue.secteur.municipalite.id = :municipaliteId")
    List<AvisPaiement> findByMunicipaliteId(@Param("municipaliteId") Long municipaliteId);

    // Trouver les avis d'un propriétaire avec un statut spécifique
    List<AvisPaiement> findByProprietaireIdAndStatut(Long proprietaireId, StatutPaiement statut);
}