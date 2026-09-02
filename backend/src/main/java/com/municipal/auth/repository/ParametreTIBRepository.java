package com.municipal.auth.repository;

import com.municipal.auth.entity.ParametreTIB;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParametreTIBRepository extends JpaRepository<ParametreTIB, Long> {
    // Singleton : on utilise toujours la première ligne (id le plus bas)
}
