// PrixReference.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "prix_reference")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrixReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annee_fiscale", nullable = false)
    private Integer anneeFiscale;

    @Column(name = "type_bien", nullable = false)
    private String typeBien;

    @Column(name = "prix_m2", nullable = false)
    private Double prixM2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalite_id", nullable = false)
    private Municipalite municipalite;

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    @Column(name = "date_modification")
    private LocalDate dateModification;
}