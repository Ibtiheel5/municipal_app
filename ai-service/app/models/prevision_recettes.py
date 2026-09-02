# app/models/prevision_recettes.py
"""
Phase 3 — Prévision des recettes municipales.
"""
import warnings
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import joblib

from app.data.extraction import DataExtractor

warnings.filterwarnings("ignore")

MODEL_PATH = Path("models_trained") / "prevision_recettes.joblib"


class PrevisionRecettesModel:
    """Modèle de prévision des recettes."""

    def __init__(self):
        self.model = None
        self.history = None
        self.model_type = None  # 'sarima' ou 'simple'
        self._load()

    def _load(self):
        if MODEL_PATH.exists():
            data = joblib.load(MODEL_PATH)
            self.model = data.get("model")
            self.history = data.get("history")
            self.model_type = data.get("model_type")

    def _save(self):
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "model": self.model,
            "history": self.history,
            "model_type": self.model_type,
        }, MODEL_PATH)

    @property
    def is_trained(self) -> bool:
        return self.model is not None

    def prepare_data(self) -> pd.Series:
        """Prépare les données de recettes mensuelles."""
        extractor = DataExtractor()
        df_recettes = extractor.get_recettes()

        if df_recettes.empty:
            raise ValueError("Aucune recette trouvée dans la base.")

        df_recettes["date"] = pd.to_datetime(df_recettes["dateGeneration"])
        df_recettes["mois"] = df_recettes["date"].dt.to_period("M")

        monthly = df_recettes.groupby("mois")["montant"].sum()
        ts = monthly.to_timestamp()
        ts = ts.asfreq("MS").fillna(0)

        self.history = ts
        return ts

    def train(self, force=False) -> dict:
        """Entraîne le modèle (SARIMA ou simple selon les données)."""
        if self.is_trained and not force:
            return {
                "status": "already_trained",
                "n_observations": len(self.history),
                "start_date": self.history.index[0].strftime("%Y-%m-%d"),
                "end_date": self.history.index[-1].strftime("%Y-%m-%d"),
                "model_type": self.model_type or "unknown",
            }

        ts = self.prepare_data()

        if len(ts) < 2:
            raise ValueError(f"Pas assez de données ({len(ts)} mois). Minimum 2 mois requis.")

        # Pour 2-5 mois : utiliser une moyenne mobile simple
        if len(ts) <= 5:
            self.model_type = "simple"
            # Stocker la moyenne et la tendance
            self.model = {
                "mean": float(ts.mean()),
                "std": float(ts.std()) if len(ts) > 1 else 0,
                "trend": float(ts.diff().mean()) if len(ts) > 1 else 0,
                "last_value": float(ts.iloc[-1]),
            }
        else:
            # Pour 6+ mois : utiliser SARIMA
            from statsmodels.tsa.statespace.sarimax import SARIMAX
            self.model_type = "sarima"
            model = SARIMAX(
                ts,
                order=(1, 1, 1),
                seasonal_order=(1, 1, 1, 12) if len(ts) >= 12 else None,
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            self.model = model.fit(disp=False)

        self.history = ts
        self._save()

        return {
            "status": "trained",
            "n_observations": len(ts),
            "start_date": ts.index[0].strftime("%Y-%m-%d"),
            "end_date": ts.index[-1].strftime("%Y-%m-%d"),
            "model_type": self.model_type,
            "mean": float(ts.mean()) if self.model_type == "simple" else None,
        }

    def predict(self, steps: int = 12) -> Dict[str, Any]:
        """Prédit les recettes pour les prochains mois."""
        if not self.is_trained:
            raise RuntimeError("Modèle non entraîné. Appelle POST /api/ai/prevision/train d'abord.")

        # Modèle simple : moyenne + tendance
        if self.model_type == "simple":
            mean = self.model["mean"]
            trend = self.model["trend"]
            last_value = self.model["last_value"]

            # Prévision : tendance linéaire
            forecast_values = []
            for i in range(1, steps + 1):
                val = last_value + trend * i
                # Éviter les valeurs négatives
                val = max(val, 0)
                forecast_values.append(val)

        # Modèle SARIMA
        else:
            try:
                forecast = self.model.forecast(steps)
                forecast_values = [float(v) for v in forecast.values]
            except Exception as e:
                # Fallback si SARIMA échoue
                mean = self.history.mean()
                forecast_values = [float(mean)] * steps

        # Générer les dates
        last_date = self.history.index[-1]
        future_dates = [
            (last_date + timedelta(days=32 * i)).replace(day=1)
            for i in range(1, steps + 1)
        ]

        return {
            "history": {
                "dates": [d.strftime("%Y-%m-%d") for d in self.history.index],
                "values": [float(v) for v in self.history.values],
            },
            "forecast": {
                "dates": [d.strftime("%Y-%m-%d") for d in future_dates],
                "values": forecast_values,
            },
            "summary": {
                "total_historique": float(self.history.sum()),
                "moyenne_mensuelle_historique": float(self.history.mean()),
                "total_prevu": float(sum(forecast_values)),
                "moyenne_mensuelle_prevue": float(sum(forecast_values) / len(forecast_values)),
            }
        }