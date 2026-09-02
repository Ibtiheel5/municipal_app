package com.municipal.auth.repository;

import com.municipal.auth.entity.Municipalite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MunicipaliteRepository extends JpaRepository<Municipalite, Long> {
}