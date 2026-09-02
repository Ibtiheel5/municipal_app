// DensiteUrbaineRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.DensiteUrbaine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DensiteUrbaineRepository extends JpaRepository<DensiteUrbaine, Long> {

    List<DensiteUrbaine> findByActifTrueOrderByPrixDensiteDesc();

    List<DensiteUrbaine> findAllByOrderByPrixDensiteDesc();
}
