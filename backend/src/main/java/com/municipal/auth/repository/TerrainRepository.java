// TerrainRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.Terrain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TerrainRepository extends JpaRepository<Terrain, Long> {

    List<Terrain> findByProprietaireId(Long proprietaireId);

    List<Terrain> findByRueId(Long rueId);
}
