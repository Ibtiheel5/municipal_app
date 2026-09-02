# Brancher la création automatique des Recettes (v2)

⚠️ Le signature de `creerRecette(...)` a changé depuis la première livraison
(ajout de `bien` et `dateDebutImposition`, nécessaires pour le relevé de
compte annuel). Si vous aviez déjà branché la v1, mettez à jour l'appel.

## 1. TIBGestionService.java

### a) Injecter RecetteService

```java
public class TIBGestionService {

    private final UserRepository userRepository;
    private final RueRepository rueRepository;
    private final ProprietaireRepository proprietaireRepository;
    private final BienImmobilierRepository bienImmobilierRepository;
    private final AvisPaiementRepository avisPaiementRepository;
    private final RecetteService recetteService;   // ⬅ AJOUT

    public TIBGestionService(UserRepository userRepository, RueRepository rueRepository,
                             ProprietaireRepository proprietaireRepository,
                             BienImmobilierRepository bienImmobilierRepository,
                             AvisPaiementRepository avisPaiementRepository,
                             RecetteService recetteService) {   // ⬅ AJOUT
        this.userRepository = userRepository;
        this.rueRepository = rueRepository;
        this.proprietaireRepository = proprietaireRepository;
        this.bienImmobilierRepository = bienImmobilierRepository;
        this.avisPaiementRepository = avisPaiementRepository;
        this.recetteService = recetteService;   // ⬅ AJOUT
    }
```

### b) Appeler creerRecette() à la fin de genererAvis()

```java
        avis = avisPaiementRepository.save(avis);

        // ⬅ AJOUT : synchronisation automatique avec le Dashboard Recettes
        recetteService.creerRecette(
                TypeRecette.TIB,
                avis.getId(),
                avis.getNumeroAvis(),
                avis.getProprietaire(),
                avis.getBien().getRue(),
                avis.getBien(),                    // ⬅ NOUVEAU paramètre : le bien
                dateDebutImposition,                // ⬅ NOUVEAU paramètre : LocalDate, voir note ci-dessous
                dateEmission.getYear(),
                avis.getMontant(),
                avis.getDateEmission(),
                avis.getDateLimite()
        );

        return mapToAvisResponse(avis);
    }
```

**Note sur `dateDebutImposition`** : si vous êtes passés à la version 4-sections
du module TIB (`AvisTIB`, décrite dans vos notes), le formulaire de
génération d'avis contient déjà un champ `dateDebutImposition` — passez-le
directement. Si vous êtes encore sur l'ancien `TIBGestionService.genererAvis`
(celui que vous m'avez donné, qui ne connaît pas cette notion), le plus
simple est d'utiliser la date du premier avis jamais généré pour ce bien :

```java
LocalDate dateDebutImposition = avisPaiementRepository
        .findByBienIdOrderByDateEmissionAsc(avis.getBien().getId())  // à ajouter au repository si absent
        .stream().findFirst()
        .map(AvisPaiement::getDateEmission)
        .orElse(dateEmission);
```

Ou plus simplement, si vous avez une date de début d'imposition stockée sur
le bien lui-même (`BienImmobilier.getDateDebutImposition()`), utilisez-la
directement — c'est l'option la plus propre à terme.

## 2. Service TNB (équivalent de TIBGestionService pour la TNB)

Même principe, avec les 2 nouveaux paramètres :

```java
recetteService.creerRecette(
        TypeRecette.TNB,
        avisTNB.getId(),
        avisTNB.getNumeroAvis(),
        avisTNB.getProprietaire(),
        avisTNB.getBien().getRue(),
        avisTNB.getBien(),
        dateDebutImpositionTNB,
        avisTNB.getAnneeFiscale(),
        avisTNB.getMontant(),
        avisTNB.getDateEmission(),
        avisTNB.getDateLimite()
);
```

## 3. Idempotence

La clé canonique est maintenant `(bien, type, annéeFiscale)` — un bien ne
peut avoir qu'une seule recette par année et par type de taxe (contrainte
SQL `uq_recette_bien_annee`). Régénérer un avis pour une année déjà connue
retourne la recette existante sans la dupliquer.
