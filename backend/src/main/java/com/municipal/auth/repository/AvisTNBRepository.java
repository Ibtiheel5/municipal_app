// AvisTNBRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.AvisTNB;
import com.municipal.auth.entity.MethodeCalculTNB;
import com.municipal.auth.entity.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvisTNBRepository extends JpaRepository<AvisTNB, Long> {

    List<AvisTNB> findByProprietaireIdOrderByDateCreationEnrDesc(Long proprietaireId);

    long count();

    @Query("""
        SELECT a FROM AvisTNB a
        WHERE a.rue.secteur.municipalite.id = :municipaliteId
          AND (:annee IS NULL OR a.anneeFiscale = :annee)
          AND (:statut IS NULL OR a.statut = :statut)
          AND (:methode IS NULL OR a.methode = :methode)
          AND (:search IS NULL OR :search = ''
               OR LOWER(a.proprietaire.nom) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.proprietaire.prenom) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.proprietaire.cin) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.numeroAvis) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.codeTnb) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY a.dateCreationEnr DESC
        """)
    List<AvisTNB> rechercher(
            @Param("municipaliteId") Long municipaliteId,
            @Param("annee") Integer annee,
            @Param("statut") StatutPaiement statut,
            @Param("methode") MethodeCalculTNB methode,
            @Param("search") String search
    );
}
