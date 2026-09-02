package com.municipal.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "municipalites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Municipalite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column
    private String description;

    @OneToMany(mappedBy = "municipalite", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // ✅ Important pour éviter les boucles de sérialisation
    @ToString.Exclude
    private List<Secteur> secteurs;

    @OneToMany(mappedBy = "municipalite", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<User> users;
}