// AvisPaiement.java
package com.municipal.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "avis_paiement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisPaiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroAvis;

    @Column(nullable = false)
    private LocalDate dateEmission;

    @Column(nullable = false)
    private LocalDate dateLimite;

    @Column(nullable = false)
    private Double montant;

    @Column(nullable = false)
    private Double surface;

    @Column(nullable = false)
    private Double taux;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPaiement statut;

    @Column
    private LocalDateTime datePaiement;

    @ManyToOne
    @JoinColumn(name = "bien_id", nullable = false)
    private BienImmobilier bien;

    @ManyToOne
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private Proprietaire proprietaire;

    @Column
    private String observations;
}