Phase 2 — Scoring de risque de retard/impayé
Nouveaux fichiers
plain
ai-service/
├── app/
│   ├── main.py                    ← mis à jour (v0.2.0, router risque)
│   ├── models/
│   │   └── risque_retard.py      ← feature engineering + RandomForest
│   ├── routers/
│   │   └── risque.py              ← GET /{id} + POST /train
│   └── schemas/
│       └── risque.py              ← Pydantic models
├── notebooks/
│   └── 01_feature_engineering_risque.ipynb
├── scripts/
│   └── train_risque_model.py
└── models_trained/
├── risque_retard.joblib       ← généré après entraînement
└── risque_scaler.joblib       ← généré après entraînement
Endpoints
Feuilles de calcul
Méthode	Endpoint	Description
GET	/api/ai/risque/{proprietaire_id}	Score de risque 0-100 + niveau
POST	/api/ai/risque/train?force=false	Entraîne le modèle sur les données actuelles
Workflow
1. Entraîner le modèle
   bash
# Via l'API
curl -X POST http://localhost:8000/api/ai/risque/train

# Ou via le script standalone
python scripts/train_risque_model.py
2. Prédire pour un propriétaire
   bash
   curl http://localhost:8000/api/ai/risque/42
   Réponse :
   JSON
   {
   "proprietaire_id": 42,
   "score": 73,
   "classe": 2,
   "niveau": "eleve",
   "couleur": "#f97316",
   "probabilites": {
   "faible": 0.05,
   "moyen": 0.15,
   "eleve": 0.65,
   "critique": 0.15
   },
   "features": {
   "nb_avis_total": 5,
   "nb_avis_en_retard": 3,
   ...
   }
   }
3. Explorer avec le notebook
   bash
   cd notebooks
   jupyter notebook 01_feature_engineering_risque.ipynb
   Features utilisées
   Feuilles de calcul
   Feature	Description
   nb_avis_total	Nombre total d'avis TIB+TNB
   nb_avis_en_retard	Nombre d'avis avec statut EN_RETARD
   ratio_retard	nb_avis_en_retard / nb_avis_total
   nb_paiements	Nombre de paiements enregistrés
   ratio_paiement_moyen	Montant payé / Montant dû (moyenne)
   montant_total_du	Somme de toutes les taxes
   montant_total_restant	Montant encore impayé
   delai_moyen_paiement_jours	Délai moyen entre date limite et paiement
   nb_retards_historique	Alias de nb_avis_en_retard
   superficie	Superficie du bien
   nb_annees_fiscales	Diversité des années fiscales
   diversite_types	Nombre de types de biens différents
   montant_moyen_avis	Montant moyen par avis
   Prochaine étape : Phase 3
   Prévision des recettes (séries temporelles avec statsmodels ou Prophet).