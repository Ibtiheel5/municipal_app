package com.municipal.auth.repository;

import com.municipal.auth.entity.User;
import com.municipal.auth.entity.UserStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatut(UserStatut statut);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.municipalite WHERE u.email = :email")
    Optional<User> findByEmailWithMunicipalite(@Param("email") String email);
}