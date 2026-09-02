// PaiementRepository.java (v2 — avec count)
package com.municipal.auth.repository;

import com.municipal.auth.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    List<Paiement> findByRecetteIdOrderByDatePaiementDesc(Long recetteId);

    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p WHERE p.recette.id = :recetteId")
    double sumMontantByRecetteId(@Param("recetteId") Long recetteId);

    Optional<Paiement> findByNumeroQuittance(String numeroQuittance);
}