# Brancher le Dashboard Recettes — 2 dashboards indépendants + écran de choix

Comme demandé : `DashboardUser` (Municipalité) et `DashboardRecettes` sont
deux dashboards **totalement séparés**, sans aucun bouton pour passer de
l'un à l'autre. Le choix se fait **une seule fois**, juste après la
connexion, sur un nouvel écran `ChoixDashboardPage`.

```
Login réussi (rôle USER)
        │
        ▼
  /user/choix  (ChoixDashboardPage — 2 cartes)
   ├── carte "Dashboard Municipalité" → /user/dashboard
   └── carte "Dashboard Recettes"     → /user/recettes
```

Une fois sur `/user/dashboard` ou `/user/recettes`, il n'y a plus de lien
entre les deux : chacun a sa propre navbar avec uniquement "Déconnexion".
Pour changer d'espace, l'utilisateur se reconnecte (ou tape l'URL
directement).

## Fichiers fournis ici (nouveaux, sauf mention contraire)

```
src/App.jsx                        → REMPLACER (route /user/choix ajoutée)
src/pages/LoginPage.jsx             → REMPLACER (redirige vers /user/choix au lieu de /user/dashboard)
src/pages/ChoixDashboardPage.jsx    → nouveau
src/pages/ChoixDashboardPage.css    → nouveau
src/pages/DashboardRecettes.jsx     → nouveau (plus de bouton de bascule)
src/pages/DashboardRecettes.css     → nouveau
src/pages/RecettesPage.jsx          → nouveau
src/pages/RecettesPage.css          → nouveau
src/pages/ComingSoonPage.jsx        → nouveau
src/services/recetteService.js      → nouveau
```

`DashboardUser.jsx` **n'a plus besoin d'être modifié** — remis tel qu'il
était dans votre version originale (le bouton que j'avais ajouté au tour
précédent a été retiré).

## Ce qui a changé dans App.jsx

```jsx
import ChoixDashboardPage from './pages/ChoixDashboardPage';
// ...
<Route element={<ProtectedRoute />}>
  <Route path="/user/choix" element={<ChoixDashboardPage />} />
  <Route path="/user/dashboard" element={<DashboardUser />} />
  <Route path="/user/recettes" element={<DashboardRecettes />} />
</Route>
```

## Ce qui a changé dans LoginPage.jsx

Une seule ligne, dans le `else` final de `handleSubmit` :

```diff
- navigate('/user/dashboard');
+ navigate('/user/choix');
```

(ADMIN continue d'aller directement sur `/admin/dashboard`, inchangé.)

## À noter sur ProtectedRoute.jsx (pas modifié, juste un repère)

Dans le cas `requiredRole` non satisfait, il redirige vers
`/dashboard-admin` ou `/dashboard-user` — des chemins qui ne correspondent
à aucune route de votre `App.jsx` (vos vraies routes sont `/admin/dashboard`
et `/user/dashboard`). Ce n'est pas lié à ce module, mais si vous voyez un
jour un utilisateur atterrir sur une page blanche après un refus de rôle,
c'est probablement ça. Dites-moi si vous voulez que je le corrige.

## Vérification

1. Connexion en tant que USER → atterrit sur `/user/choix`, deux grandes
   cartes rouge (Municipalité) et bleue (Recettes).
2. Clic sur une carte → dashboard correspondant, navbar propre à lui, sans
   trace de l'autre dashboard.
3. Déconnexion + reconnexion → repasse par `/user/choix`.
