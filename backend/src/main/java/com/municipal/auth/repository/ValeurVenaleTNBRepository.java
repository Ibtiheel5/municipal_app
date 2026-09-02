// ValeurVenaleTNBRepository.java
package com.municipal.auth.repository;

import com.municipal.auth.entity.ValeurVenaleTNB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValeurVenaleTNBRepository extends JpaRepository<ValeurVenaleTNB, Long> {

    List<ValeurVenaleTNB> findAllByOrderByAnneeDesc();

    List<ValeurVenaleTNB> findByAnnee(Integer annee);
}
