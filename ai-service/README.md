# Baladiya AI Service — Phase 1

Microservice IA/Data indépendant du backend Spring Boot, communiquant avec lui
par API REST. Phase 1 : socle FastAPI + extraction des données.

## 1. Intégration côté Spring Boot (à faire en premier)

Copier le contenu de `backend-additions/` dans ton projet Spring Boot, en
respectant les packages :

```
backend-additions/com/municipal/auth/dto/export/*.java
    → src/main/java/com/municipal/auth/dto/export/

backend-additions/com/municipal/auth/service/AiExportService.java
    → src/main/java/com/municipal/auth/service/

backend-additions/com/municipal/auth/controller/AiExportController.java
    → src/main/java/com/municipal/auth/controller/
```

Rien d'autre à modifier : `SecurityConfig` protège déjà tout `/api/admin/**`
avec `hasRole("ADMIN")`, donc les nouvelles routes sont automatiquement
sécurisées.

### Créer un compte de service dédié

Ne réutilise pas ton propre compte admin. Crée un compte séparé pour le
microservice IA (traçabilité, révocation facile) :

1. Inscris-toi normalement via `/api/auth/register` avec l'email
   `ai-service@baladiya.tn` (ou autre)
2. Depuis un compte ADMIN existant, valide ce compte et passe-le en rôle
   ADMIN directement en base (`UPDATE users SET role='ADMIN', statut='ACTIF'
   WHERE email='ai-service@baladiya.tn'`) — pas d'UI pour changer un rôle
   USER→ADMIN pour l'instant, c'est normal.

### Vérifier manuellement les nouveaux endpoints

```bash
# Récupérer un token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ai-service@baladiya.tn","password":"..."}'

# Tester un export (remplacer TOKEN)
curl http://localhost:8081/api/admin/ai/export/recettes \
  -H "Authorization: Bearer TOKEN"
```

## 2. Installation du microservice Python

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# → éditer .env : SPRING_BOOT_URL, AI_SERVICE_EMAIL, AI_SERVICE_PASSWORD
```

## 3. Lancer le microservice

```bash
uvicorn app.main:app --reload --port 8000
```

Documentation interactive auto-générée : http://localhost:8000/docs

## 4. Vérifier que tout communique

```bash
# Santé du service
curl http://localhost:8000/health

# Connexion au backend Spring Boot
curl http://localhost:8000/health/backend

# Extraction complète des 5 datasets (aperçu)
curl http://localhost:8000/health/dataset

# Ou, plus lisible, le script dédié :
python scripts/test_extraction.py
```

Si `health/dataset` renvoie les 5 datasets avec leurs colonnes sans erreur,
la Phase 1 est validée de bout en bout : Spring Boot expose les données,
FastAPI les récupère et les transforme en DataFrames pandas.

## Structure du projet

```
ai-service/
├── app/
│   ├── main.py              # point d'entrée FastAPI
│   ├── config.py            # variables d'environnement
│   ├── data/
│   │   └── extraction.py    # récupère les données depuis Spring Boot
│   ├── routers/
│   │   ├── health.py        # diagnostic (Phase 1)
│   │   └── risque.py        # scoring de risque (stub, Phase 2)
│   ├── models/               # modèles ML entraînés (Phase 2+)
│   └── schemas/              # schémas Pydantic des requêtes/réponses
├── models_trained/            # fichiers .joblib des modèles sauvegardés
├── notebooks/                 # exploration et entraînement
├── scripts/
│   └── test_extraction.py    # vérification manuelle Phase 1
├── requirements.txt
└── .env.example
```

## Prochaine étape : Phase 2

Une fois cette phase validée (tu vois tes vraies données de recettes
remonter dans `/health/dataset`), on construit le modèle de scoring de
risque de retard/impayé dans `app/models/risque_retard.py`, avec le feature
engineering en pandas et l'entraînement scikit-learn dans un notebook.
