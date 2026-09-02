# app/models/segmentation.py
"""
Phase 4 — Segmentation des contribuables.

Utilise K-Means pour regrouper les propriétaires par profil.
"""
import warnings
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from app.data.extraction import DataExtractor

warnings.filterwarnings("ignore")

MODEL_PATH = Path("models_trained") / "segmentation.joblib"
SCALER_PATH = Path("models_trained") / "segmentation_scaler.joblib"

SEGMENT_FEATURES = [
    "nb_avis_total",
    "ratio_retard",
    "ratio_paiement_moyen",
    "montant_total_du",
    "montant_total_restant",
    "superficie",
    "nb_annees_fiscales",
]

SEGMENT_LABELS = {
    0: "✅ Bon payeur - Faible risque",
    1: "⚠️ Payeur occasionnel - Risque modéré",
    2: "🔶 Payeur irrégulier - Risque élevé",
    3: "🔴 Payeur à risque - Prioritaire",
}


class SegmentationModel:
    """Modèle de segmentation des contribuables."""

    def __init__(self):
        self.model: Optional[KMeans] = None
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

    def prepare_data(self, df_features):
        """Prépare les données pour la segmentation."""
        df = df_features.copy()
        df = df.dropna(subset=SEGMENT_FEATURES)
        df = df.replace([np.inf, -np.inf], 0)
        return df

    def train(self, force=False) -> dict:
        if self.is_trained and not force:
            return {
                "status": "already_trained",
                "n_clusters": self.model.n_clusters,
                "n_samples": len(self.model.cluster_centers_),
            }

        from app.models.risque_retard import _build_features

        extractor = DataExtractor()
        df_recettes = extractor.get_recettes()
        df_paiements = extractor.get_paiements()
        df_proprietaires = extractor.get_proprietaires()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()

        df_features = _build_features(
            df_recettes, df_paiements, df_proprietaires, df_avis_tib, df_avis_tnb
        )

        df = self.prepare_data(df_features)

        if len(df) < 4:
            raise ValueError(f"Pas assez de données ({len(df)} propriétaires). Minimum 4 requis.")

        X = df[SEGMENT_FEATURES].values
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Si moins de 10, réduire le nombre de clusters
        n_clusters = min(4, len(df))
        self.model = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init=10,
        )
        self.model.fit(X_scaled)

        self._save()

        return {
            "status": "trained",
            "n_clusters": self.model.n_clusters,
            "n_samples": len(df),
            "inertia": float(self.model.inertia_),
        }

    def segment(self, proprietaire_id: int = None) -> Dict[str, Any]:
        """
        Segmente les contribuables.

        Args:
            proprietaire_id: ID d'un propriétaire spécifique (optionnel)

        Returns:
            Dict avec les segments
        """
        if not self.is_trained:
            raise RuntimeError("Modèle non entraîné. Appelle POST /api/ai/segmentation/train d'abord.")

        from app.models.risque_retard import _build_features

        extractor = DataExtractor()
        df_recettes = extractor.get_recettes()
        df_paiements = extractor.get_paiements()
        df_proprietaires = extractor.get_proprietaires()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()

        df_features = _build_features(
            df_recettes, df_paiements, df_proprietaires, df_avis_tib, df_avis_tnb
        )

        df = self.prepare_data(df_features)
        X = df[SEGMENT_FEATURES].values
        X_scaled = self.scaler.transform(X)

        # Prédire les segments
        df["segment"] = self.model.predict(X_scaled)
        df["segment_label"] = df["segment"].map(SEGMENT_LABELS)

        if proprietaire_id:
            row = df[df["proprietaire_id"] == proprietaire_id]
            if row.empty:
                raise ValueError(f"Propriétaire {proprietaire_id} non trouvé")
            return {
                "proprietaire_id": proprietaire_id,
                "segment": int(row.iloc[0]["segment"]),
                "segment_label": row.iloc[0]["segment_label"],
                "features": row[SEGMENT_FEATURES].iloc[0].to_dict(),
            }

        # Statistiques par segment
        stats = df.groupby("segment").agg({
            "proprietaire_id": "count",
            "nb_avis_total": "mean",
            "ratio_retard": "mean",
            "ratio_paiement_moyen": "mean",
            "montant_total_du": "mean",
            "montant_total_restant": "mean",
            "superficie": "mean",
        }).round(2)

        stats["segment_label"] = stats.index.map(lambda x: SEGMENT_LABELS.get(x, f"Segment {x}"))

        return {
            "total_proprietaires": len(df),
            "segments": stats.to_dict(orient="index"),
            "segments_list": [
                {
                    "segment": int(idx),
                    "label": SEGMENT_LABELS.get(idx, f"Segment {idx}"),
                    "count": int(row["proprietaire_id"]),
                    "moyenne_retard": float(row["ratio_retard"]),
                    "moyenne_paiement": float(row["ratio_paiement_moyen"]),
                    "montant_moyen_du": float(row["montant_total_du"]),
                }
                for idx, row in stats.iterrows()
            ],
        }