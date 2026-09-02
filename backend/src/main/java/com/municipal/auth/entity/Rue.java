package com.municipal.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "rues")
public class Rue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(name = "prix_reference_m2", nullable = false)
    private Double prixReferenceM2;

    @Column(nullable = false)
    private Double taux;

    @Column(name = "taux_base", nullable = false)
    private Double tauxBase = 0.02;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatRoute etat = EtatRoute.BONNE;

    @Column(nullable = false)
    private Boolean eclairagePublic = false;

    @Column(nullable = false)
    private Boolean assainissement = false;

    @Column(nullable = false)
    private Boolean eauPotable = false;

    @Column(nullable = false)
    private Boolean electricite = false;

    @Column(nullable = false)
    private Boolean voirie = false;

    @Column(nullable = false)
    private Boolean proprete = false;

    @Column(nullable = false)
    private Boolean autreCritere = false;

    @Column(length = 255)
    private String autreCritereDetails;

    @Column(length = 500)
    private String observations;

    @Column(nullable = false)
    private Integer priorite = 1;

    @Column(nullable = false)
    private Integer nbCriteresCoches = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secteur_id", nullable = false)
    @JsonIgnore  // ✅ Important
    private Secteur secteur;

    @OneToMany(mappedBy = "rue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // ✅ Important
    private List<Proprietaire> proprietaires;

    // Constructeurs
    public Rue() {}

    public Rue(Long id, String nom, Double prixReferenceM2, Double taux, Double tauxBase,
               EtatRoute etat, Boolean eclairagePublic, Boolean assainissement,
               Boolean eauPotable, Boolean electricite, Boolean voirie, Boolean proprete,
               Boolean autreCritere, String autreCritereDetails, String observations,
               Integer priorite, Integer nbCriteresCoches, Secteur secteur) {
        this.id = id;
        this.nom = nom;
        this.prixReferenceM2 = prixReferenceM2;
        this.taux = taux;
        this.tauxBase = tauxBase;
        this.etat = etat;
        this.eclairagePublic = eclairagePublic;
        this.assainissement = assainissement;
        this.eauPotable = eauPotable;
        this.electricite = electricite;
        this.voirie = voirie;
        this.proprete = proprete;
        this.autreCritere = autreCritere;
        this.autreCritereDetails = autreCritereDetails;
        this.observations = observations;
        this.priorite = priorite;
        this.nbCriteresCoches = nbCriteresCoches;
        this.secteur = secteur;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getPrixReferenceM2() { return prixReferenceM2; }
    public void setPrixReferenceM2(Double prixReferenceM2) { this.prixReferenceM2 = prixReferenceM2; }

    public Double getTaux() { return taux; }
    public void setTaux(Double taux) { this.taux = taux; }

    public Double getTauxBase() { return tauxBase; }
    public void setTauxBase(Double tauxBase) { this.tauxBase = tauxBase; }

    public EtatRoute getEtat() { return etat; }
    public void setEtat(EtatRoute etat) { this.etat = etat; }

    public Boolean getEclairagePublic() { return eclairagePublic; }
    public void setEclairagePublic(Boolean eclairagePublic) { this.eclairagePublic = eclairagePublic; }

    public Boolean getAssainissement() { return assainissement; }
    public void setAssainissement(Boolean assainissement) { this.assainissement = assainissement; }

    public Boolean getEauPotable() { return eauPotable; }
    public void setEauPotable(Boolean eauPotable) { this.eauPotable = eauPotable; }

    public Boolean getElectricite() { return electricite; }
    public void setElectricite(Boolean electricite) { this.electricite = electricite; }

    public Boolean getVoirie() { return voirie; }
    public void setVoirie(Boolean voirie) { this.voirie = voirie; }

    public Boolean getProprete() { return proprete; }
    public void setProprete(Boolean proprete) { this.proprete = proprete; }

    public Boolean getAutreCritere() { return autreCritere; }
    public void setAutreCritere(Boolean autreCritere) { this.autreCritere = autreCritere; }

    public String getAutreCritereDetails() { return autreCritereDetails; }
    public void setAutreCritereDetails(String autreCritereDetails) { this.autreCritereDetails = autreCritereDetails; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public Integer getPriorite() { return priorite; }
    public void setPriorite(Integer priorite) { this.priorite = priorite; }

    public Integer getNbCriteresCoches() { return nbCriteresCoches; }
    public void setNbCriteresCoches(Integer nbCriteresCoches) { this.nbCriteresCoches = nbCriteresCoches; }

    public Secteur getSecteur() { return secteur; }
    public void setSecteur(Secteur secteur) { this.secteur = secteur; }

    public List<Proprietaire> getProprietaires() { return proprietaires; }
    public void setProprietaires(List<Proprietaire> proprietaires) { this.proprietaires = proprietaires; }
}