// RueRepository.java - Ajout de la méthode countBySecteurId
package com.municipal.auth.repository;

import com.municipal.auth.entity.Rue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RueRepository extends JpaRepository<Rue, Long> {

    List<Rue> findBySecteurId(Long secteurId);

    // Nouvelle méthode pour compter les rues d'un secteur
    long countBySecteurId(Long secteurId);
}