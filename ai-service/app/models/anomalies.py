# app/models/anomalies.py
"""
Phase 4 — Détection d'anomalies dans les déclarations TIB/TNB.
"""
import warnings
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from app.data.extraction import DataExtractor

warnings.filterwarnings("ignore")

MODEL_PATH = Path("models_trained") / "anomalies.joblib"
SCALER_PATH = Path("models_trained") / "anomalies_scaler.joblib"

ANOMALY_FEATURES = [
    "surface",
    "montant_par_m2",
    "nb_avis_par_proprietaire",
    "ecart_type_montant",
    "ratio_retard_par_proprietaire",
]


class AnomalyDetectionModel:
    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self._load()

    def _load(self):
        if MODEL_PATH.exists() and SCALER_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)

    def _save(self):
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

    @property
    def is_trained(self) -> bool:
        return self.model is not None and self.scaler is not None

    def prepare_data(self, df_avis_tib, df_avis_tnb, df_proprietaires, df_recettes):
        """Prépare les données pour la détection d'anomalies."""
        # 1. Fusionner TIB et TNB
        df_avis = pd.concat([df_avis_tib, df_avis_tnb], ignore_index=True, sort=False)

        if df_avis.empty:
            raise ValueError("Aucun avis trouvé dans la base.")

        # 2. Sauvegarder l'ID (peut s'appeler 'id' ou 'avisId')
        if 'id' in df_avis.columns:
            avis_ids = df_avis['id'].copy()
        elif 'avisId' in df_avis.columns:
            avis_ids = df_avis['avisId'].copy()
        else:
            # Créer un ID artificiel
            avis_ids = df_avis.index + 1
        df_avis['avis_id'] = avis_ids

        # 3. Ajouter la superficie des propriétaires
        if not df_proprietaires.empty and 'id' in df_proprietaires.columns:
            # Renommer la colonne 'id' du propriétaire pour éviter conflit
            prop_cols = df_proprietaires[['id', 'superficie']].copy()
            prop_cols = prop_cols.rename(columns={'id': 'proprietaire_id'})
            df_avis = df_avis.merge(prop_cols, left_on='proprietaireId', right_on='proprietaire_id', how='left')
            df_avis = df_avis.drop(columns=['proprietaire_id'])
        else:
            df_avis['superficie'] = 0

        # 4. Ajouter les recettes (montantPaye)
        if not df_recettes.empty and 'referenceTaxeId' in df_recettes.columns:
            recettes_cols = df_recettes[['referenceTaxeId', 'montantPaye']].copy()
            # On utilise 'id' de l'avis comme référence
            df_avis = df_avis.merge(recettes_cols, left_on='id', right_on='referenceTaxeId', how='left')
            # Si le merge a ajouté des colonnes avec suffixe, les nettoyer
            if 'montantPaye_x' in df_avis.columns:
                df_avis['montantPaye'] = df_avis['montantPaye_x'].fillna(0)
            elif 'montantPaye' not in df_avis.columns:
                df_avis['montantPaye'] = 0

        # 5. Calculer le montant total (TIB: taxeTotale, TNB: montantTnb)
        df_avis['montant_total'] = df_avis.apply(
            lambda row: row.get('taxeTotale', row.get('montantTnb', row.get('montantTib', 0))),
            axis=1
        ).fillna(0)

        # 6. Nettoyer la superficie
        df_avis['superficie'] = df_avis['superficie'].fillna(0).replace(0, 1)

        # 7. Calculer montant_par_m2
        df_avis['montant_par_m2'] = (df_avis['montant_total'] / df_avis['superficie']).replace([np.inf, -np.inf], 0).fillna(0)

        # 8. Remplacer les NaN par 0
        df_avis['montantPaye'] = df_avis.get('montantPaye', 0).fillna(0)
        df_avis['montant_total'] = df_avis['montant_total'].fillna(0)

        # 9. Features par propriétaire (groupby)
        if 'proprietaireId' in df_avis.columns:
            grp = df_avis.groupby('proprietaireId')
            df_avis['nb_avis_par_proprietaire'] = df_avis['proprietaireId'].map(grp.size()).fillna(0)
            df_avis['ecart_type_montant'] = df_avis['proprietaireId'].map(
                grp['montant_total'].std().fillna(0)
            ).fillna(0)
            if 'statut' in df_avis.columns:
                df_avis['ratio_retard_par_proprietaire'] = df_avis['proprietaireId'].map(
                    grp.apply(lambda g: (g['statut'] == 'EN_RETARD').mean())
                ).fillna(0)
            else:
                df_avis['ratio_retard_par_proprietaire'] = 0
        else:
            df_avis['nb_avis_par_proprietaire'] = 1
            df_avis['ecart_type_montant'] = 0
            df_avis['ratio_retard_par_proprietaire'] = 0

        # 10. S'assurer que toutes les colonnes features existent
        for col in ANOMALY_FEATURES:
            if col not in df_avis.columns:
                df_avis[col] = 0
            df_avis[col] = df_avis[col].fillna(0).replace([np.inf, -np.inf], 0)

        # 11. Restaurer l'ID original
        df_avis['id'] = df_avis['avis_id']

        return df_avis

    def train(self, force=False) -> dict:
        if self.is_trained and not force:
            return {
                "status": "already_trained",
                "n_samples": self.model.n_samples_ if hasattr(self.model, "n_samples_") else 0,
                "contamination": self.model.contamination if hasattr(self.model, "contamination") else 0,
            }

        extractor = DataExtractor()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()
        df_proprietaires = extractor.get_proprietaires()
        df_recettes = extractor.get_recettes()

        df = self.prepare_data(df_avis_tib, df_avis_tnb, df_proprietaires, df_recettes)

        if len(df) < 10:
            raise ValueError(f"Pas assez de données ({len(df)} avis). Minimum 10 avis requis.")

        X = df[ANOMALY_FEATURES].values

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100,
        )
        self.model.fit(X_scaled)

        self._save()

        return {
            "status": "trained",
            "n_samples": len(df),
            "contamination": 0.1,
            "features": ANOMALY_FEATURES,
        }

    def detect(self, avis_id: int = None, limit: int = 50) -> Dict[str, Any]:
        if not self.is_trained:
            raise RuntimeError("Modèle non entraîné. Appelle POST /api/ai/anomalies/train d'abord.")

        extractor = DataExtractor()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()
        df_proprietaires = extractor.get_proprietaires()
        df_recettes = extractor.get_recettes()

        df = self.prepare_data(df_avis_tib, df_avis_tnb, df_proprietaires, df_recettes)

        X = df[ANOMALY_FEATURES].values
        X_scaled = self.scaler.transform(X)

        predictions = self.model.predict(X_scaled)
        scores = self.model.decision_function(X_scaled)

        df['is_anomaly'] = predictions == -1
        df['anomaly_score'] = scores

        if avis_id is not None:
            row = df[df['id'] == avis_id]
            if row.empty:
                raise ValueError(f"Avis {avis_id} non trouvé")
            row_data = row.iloc[0]
            return {
                "id": int(avis_id),
                "is_anomaly": bool(row_data['is_anomaly']),
                "anomaly_score": float(row_data['anomaly_score']),
                "features": {col: float(row_data[col]) for col in ANOMALY_FEATURES},
            }

        anomalies = df[df['is_anomaly']].sort_values('anomaly_score').head(limit)

        return {
            "total_anomalies": int(len(anomalies)),
            "anomalies": anomalies[['id', 'anomaly_score'] + ANOMALY_FEATURES].to_dict(orient='records'),
        }