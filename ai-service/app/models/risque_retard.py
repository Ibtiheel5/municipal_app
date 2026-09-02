# app/models/risque_retard.py
"""
Phase 2 — Scoring de risque de retard/impayé.

Pipeline complet :
  1. Extraction des 5 datasets depuis Spring Boot (DataExtractor)
  2. Feature engineering (historique de paiements, profil propriétaire)
  3. Prédiction avec RandomForest entraîné
  4. Score 0-100 + niveau de risque

Usage :
    from app.models.risque_retard import RisqueRetardModel
    model = RisqueRetardModel()
    result = model.predict_for_proprietaire(101)
"""
import warnings
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from app.data.extraction import DataExtractor

warnings.filterwarnings("ignore")

MODEL_PATH = Path("models_trained") / "risque_retard.joblib"
SCALER_PATH = Path("models_trained") / "risque_scaler.joblib"

FEATURE_COLS = [
    "nb_avis_total",
    "nb_avis_en_retard",
    "ratio_retard",
    "nb_paiements",
    "ratio_paiement_moyen",
    "montant_total_du",
    "montant_total_restant",
    "nb_retards_historique",
    "superficie",
    "nb_annees_fiscales",
    "montant_moyen_avis",
]


def _safe_div(a, b):
    """Division sécurisée évitant division par zéro."""
    return np.divide(a, b, out=np.zeros_like(a, dtype=float), where=b != 0)


def _ensure_column(df, col, default=0.0):
    """Ajoute une colonne avec une valeur par défaut si elle manque."""
    if col not in df.columns:
        df[col] = default
    return df


def _build_features(df_recettes, df_paiements, df_proprietaires, df_avis_tib, df_avis_tnb):
    """
    Agrège toutes les données pour construire un DataFrame
    indexé par proprietaire_id avec les features ML.
    """
    # ── Sécurisation des colonnes de base ──────────────────────────────
    # Recettes
    for col in ["proprietaireId", "id", "montant", "montantPaye"]:
        _ensure_column(df_recettes, col, 0.0)
    # Paiements
    for col in ["recetteId", "montant"]:
        _ensure_column(df_paiements, col, 0.0)
    # Propriétaires
    for col in ["id", "superficie"]:
        _ensure_column(df_proprietaires, col, 0.0)
    # Avis TIB
    for col in ["proprietaireId", "statut", "taxeTotale", "anneeFiscale"]:
        _ensure_column(df_avis_tib, col, "EN_ATTENTE" if col == "statut" else 0)
    # Avis TNB
    for col in ["proprietaireId", "statut", "montantTnb", "anneeFiscale"]:
        _ensure_column(df_avis_tnb, col, "EN_ATTENTE" if col == "statut" else 0)

    # ── Fusion TIB + TNB ──────────────────────────────────────────────
    avis_all = pd.concat([df_avis_tib, df_avis_tnb], ignore_index=True, sort=False)
    if avis_all.empty:
        return pd.DataFrame(columns=["proprietaire_id"] + FEATURE_COLS)

    # Nettoyage : s'assurer que proprietaireId est numérique
    avis_all["proprietaireId"] = pd.to_numeric(avis_all["proprietaireId"], errors="coerce")
    avis_all = avis_all.dropna(subset=["proprietaireId"])
    if avis_all.empty:
        return pd.DataFrame(columns=["proprietaire_id"] + FEATURE_COLS)

    avis_all["proprietaireId"] = avis_all["proprietaireId"].astype(int)

    # ── Features par propriétaire (depuis avis) ──────────────────────
    grp_avis = avis_all.groupby("proprietaireId")

    features_list = []
    for pid, group in grp_avis:
        nb_total = len(group)
        nb_retard = (group["statut"] == "EN_RETARD").sum()

        # Montant dû : taxeTotale (TIB) ou montantTnb (TNB)
        montant_du = 0.0
        if "taxeTotale" in group.columns:
            montant_du += group["taxeTotale"].fillna(0).sum()
        if "montantTnb" in group.columns:
            montant_du += group["montantTnb"].fillna(0).sum()

        # Montant moyen par avis
        montants_avis = []
        if "taxeTotale" in group.columns:
            montants_avis.extend(group["taxeTotale"].dropna().tolist())
        if "montantTnb" in group.columns:
            montants_avis.extend(group["montantTnb"].dropna().tolist())
        montant_moyen = np.mean(montants_avis) if montants_avis else 0.0

        features_list.append({
            "proprietaire_id": int(pid),
            "nb_avis_total": nb_total,
            "nb_avis_en_retard": int(nb_retard),
            "montant_total_du": float(montant_du),
            "montant_moyen_avis": float(montant_moyen),
            "nb_annees_fiscales": group["anneeFiscale"].nunique() if "anneeFiscale" in group.columns else 1,
        })

    features = pd.DataFrame(features_list)
    features["ratio_retard"] = _safe_div(features["nb_avis_en_retard"].values, features["nb_avis_total"].values)

    # ── Features paiements ──────────────────────────────────────────────
    pay_features = pd.DataFrame(columns=["proprietaire_id", "nb_paiements", "ratio_paiement_moyen"])
    if not df_paiements.empty and not df_recettes.empty and "proprietaireId" in df_recettes.columns:
        # Renommer la colonne 'montant' des paiements pour éviter le conflit
        paiements_renamed = df_paiements.rename(columns={"montant": "montant_paye"})

        # Fusion sur recetteId
        pay = paiements_renamed.merge(
            df_recettes[["id", "proprietaireId", "montant"]].rename(columns={"id": "recetteId"}),
            on="recetteId",
            how="left",
        )

        # S'assurer que la colonne "montant" existe (après le merge)
        _ensure_column(pay, "montant", 0.0)

        # Si le merge a échoué (pas de correspondance), on crée un DataFrame vide avec les colonnes nécessaires
        if pay.empty:
            pay = pd.DataFrame(columns=["proprietaireId", "recetteId", "montant_paye", "montant"])
        else:
            # S'assurer que la colonne "montant" existe (elle peut être absente si le merge n'a rien trouvé)
            _ensure_column(pay, "montant", 0.0)
            # Nettoyage des valeurs
            pay["proprietaireId"] = pd.to_numeric(pay["proprietaireId"], errors="coerce").fillna(0).astype(int)
            pay["montant_paye"] = pd.to_numeric(pay["montant_paye"], errors="coerce").fillna(0)
            pay["montant"] = pd.to_numeric(pay["montant"], errors="coerce").fillna(0)

        # Agrégation par propriétaire
        grp_pay = pay.groupby("proprietaireId")
        pay_list = []
        for pid, g in grp_pay:
            du = g["montant"].sum()        # montant dû total
            paye = g["montant_paye"].sum() # montant payé total
            pay_list.append({
                "proprietaire_id": int(pid),
                "nb_paiements": len(g),
                "ratio_paiement_moyen": float(paye / du) if du > 0 else 0.0,
            })
        if pay_list:
            pay_features = pd.DataFrame(pay_list)

    # ── Features recettes (montant restant) ────────────────────────────
    rec_features = pd.DataFrame(columns=["proprietaire_id", "montant_total_restant"])
    if not df_recettes.empty and "proprietaireId" in df_recettes.columns:
        df_rec = df_recettes.copy()
        df_rec["proprietaireId"] = pd.to_numeric(df_rec["proprietaireId"], errors="coerce").fillna(0).astype(int)
        rec_sum = df_rec.groupby("proprietaireId").agg({
            "montant": "sum",
            "montantPaye": "sum",
        }).reset_index()
        rec_sum["montant_total_restant"] = rec_sum["montant"] - rec_sum["montantPaye"]
        rec_features = rec_sum[["proprietaireId", "montant_total_restant"]].rename(
            columns={"proprietaireId": "proprietaire_id"}
        )

    # ── Merge propriétaires (superficie) ──────────────────────────────
    prop = pd.DataFrame(columns=["proprietaire_id", "superficie"])
    if not df_proprietaires.empty:
        df_p = df_proprietaires.copy()
        df_p["id"] = pd.to_numeric(df_p["id"], errors="coerce").fillna(0).astype(int)
        df_p["superficie"] = pd.to_numeric(df_p["superficie"], errors="coerce").fillna(0)
        prop = df_p[["id", "superficie"]].rename(columns={"id": "proprietaire_id"})

    # ── Assemblage final ──────────────────────────────────────────────
    df = features.merge(pay_features, on="proprietaire_id", how="left")
    df = df.merge(rec_features, on="proprietaire_id", how="left")
    df = df.merge(prop, on="proprietaire_id", how="left")

    # Colonnes manquantes → 0
    for col in FEATURE_COLS:
        if col not in df.columns:
            df[col] = 0.0
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    # Features dérivées
    df["nb_retards_historique"] = df["nb_avis_en_retard"]

    # Retourner seulement les colonnes utiles
    final_cols = ["proprietaire_id"] + FEATURE_COLS
    for col in final_cols:
        if col not in df.columns:
            df[col] = 0.0
    return df[final_cols]


def _generate_synthetic_target(df_features):
    """
    Génère une cible synthétique (0=faible, 1=moyen, 2=élevé, 3=critique)
    basée sur une règle métier simple.
    """
    ratio_retard = df_features["ratio_retard"].fillna(0).clip(0, 1)
    ratio_pay = df_features["ratio_paiement_moyen"].fillna(0).clip(0, 1)
    restant = df_features["montant_total_restant"].fillna(0)
    du = df_features["montant_total_du"].fillna(0).replace(0, np.nan)
    ratio_restant = (restant / du).fillna(0).clip(0, 1)

    score = (
            ratio_retard * 40 +
            (1 - ratio_pay) * 30 +
            ratio_restant * 20 +
            (df_features["nb_retards_historique"] / df_features["nb_avis_total"].replace(0, 1)) * 10
    )
    # Bins : 0-25=faible, 25-50=moyen, 50-75=élevé, 75+=critique
    return pd.cut(score, bins=[-1, 25, 50, 75, 999], labels=[0, 1, 2, 3]).astype(int)


def _calculate_risk_score(features: dict) -> tuple:
    """
    Calcule le score de risque (0-100) et le niveau associé à partir des features.

    Args:
        features: Dictionnaire des features du propriétaire

    Returns:
        tuple: (score, niveau, classe)
    """
    # Extraire les features
    ratio_retard = features.get('ratio_retard', 0)
    ratio_pay = features.get('ratio_paiement_moyen', 0)
    restant = features.get('montant_total_restant', 0)
    du = features.get('montant_total_du', 1)
    ratio_restant = restant / du if du > 0 else 0
    nb_retards = features.get('nb_retards_historique', 0)
    nb_avis = features.get('nb_avis_total', 1)

    # Même formule que _generate_synthetic_target
    score_brut = (
            ratio_retard * 40 +
            (1 - ratio_pay) * 30 +
            ratio_restant * 20 +
            (nb_retards / nb_avis) * 10
    )
    score_brut = min(max(score_brut, 0), 100)
    score = int(round(score_brut))

    # Déterminer le niveau en fonction du score
    if score <= 25:
        niveau = "faible"
        classe = 0
    elif score <= 50:
        niveau = "moyen"
        classe = 1
    elif score <= 75:
        niveau = "eleve"
        classe = 2
    else:
        niveau = "critique"
        classe = 3

    return score, niveau, classe


class RisqueRetardModel:
    """Wrapper autour du modèle de scoring de risque."""

    def __init__(self):
        self.model: Optional[RandomForestClassifier] = None
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

    # ── Entraînement ─────────────────────────────────────────
    def train(self, force=False) -> dict:
        if self.is_trained and not force:
            return {
                "status": "already_trained",
                "train_accuracy": 0.0,
                "test_accuracy": 0.0,
                "nb_samples": 0,
                "feature_importance": {},
                "model_path": str(MODEL_PATH),
            }

        extractor = DataExtractor()
        df_recettes = extractor.get_recettes()
        df_paiements = extractor.get_paiements()
        df_proprietaires = extractor.get_proprietaires()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()

        df_features = _build_features(
            df_recettes, df_paiements, df_proprietaires, df_avis_tib, df_avis_tnb
        )

        if len(df_features) < 3:
            raise ValueError(
                f"Pas assez de données pour entraîner ({len(df_features)} propriétaires). "
                "Alimente d'abord la base Spring Boot."
            )

        X = df_features[FEATURE_COLS].values
        y = _generate_synthetic_target(df_features)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        unique_classes = y.unique()
        if len(unique_classes) < 2:
            y = pd.cut(
                df_features["ratio_retard"].fillna(0) * 100,
                bins=[-1, 33, 66, 999],
                labels=[0, 1, 2],
                ).astype(int).fillna(0)
            unique_classes = y.unique()

        if len(unique_classes) < 2:
            raise ValueError("Pas assez de variance dans les données pour entraîner.")

        stratify = y if len(unique_classes) >= 2 and len(y) >= 10 else None
        test_size = 0.2 if len(y) >= 10 else 0.0

        if test_size > 0:
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y, test_size=test_size, random_state=42,
                stratify=stratify
            )
        else:
            X_train, y_train = X_scaled, y
            X_test, y_test = X_scaled, y

        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=min(8, max(2, len(y) // 2)),
            random_state=42,
            class_weight="balanced",
        )
        self.model.fit(X_train, y_train)

        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test) if test_size > 0 else train_score

        self._save()

        importance = dict(zip(FEATURE_COLS, self.model.feature_importances_.tolist()))

        return {
            "status": "trained",
            "train_accuracy": round(float(train_score), 4),
            "test_accuracy": round(float(test_score), 4),
            "nb_samples": int(len(df_features)),
            "feature_importance": importance,
            "model_path": str(MODEL_PATH),
        }

    # ── Prédiction ───────────────────────────────────────────
    def predict_for_proprietaire(self, proprietaire_id: int) -> dict:
        if not self.is_trained:
            raise RuntimeError("Modèle non entraîné. Appelle POST /api/ai/risque/train d'abord.")

        extractor = DataExtractor()
        df_recettes = extractor.get_recettes()
        df_paiements = extractor.get_paiements()
        df_proprietaires = extractor.get_proprietaires()
        df_avis_tib = extractor.get_avis_tib()
        df_avis_tnb = extractor.get_avis_tnb()

        df_features = _build_features(
            df_recettes, df_paiements, df_proprietaires, df_avis_tib, df_avis_tnb
        )

        row = df_features[df_features["proprietaire_id"] == proprietaire_id]
        if row.empty:
            raise ValueError(f"Propriétaire {proprietaire_id} introuvable dans les datasets.")

        X = row[FEATURE_COLS].values
        X_scaled = self.scaler.transform(X)

        # 1. Récupérer les probabilités du modèle
        proba = self.model.predict_proba(X_scaled)[0]
        classe_predite = int(self.model.predict(X_scaled)[0])

        # 2. Récupérer les features pour calculer le score réel
        features = row[FEATURE_COLS].iloc[0].to_dict()

        # 3. Calculer le score et le niveau avec la même logique que l'entraînement
        score_reel, niveau_reel, classe_reelle = _calculate_risk_score(features)

        # 4. Niveaux et couleurs
        niveaux = {0: "faible", 1: "moyen", 2: "eleve", 3: "critique"}
        couleurs = {0: "#22c55e", 1: "#eab308", 2: "#f97316", 3: "#ef4444"}

        # 5. Probabilités par classe
        prob_dict = {"faible": 0.0, "moyen": 0.0, "eleve": 0.0, "critique": 0.0}
        for i, p in enumerate(proba):
            key = niveaux.get(i, f"classe_{i}")
            if key in prob_dict:
                prob_dict[key] = round(float(p), 4)

        # 6. Utiliser la classe prédite par le modèle pour la couleur,
        # mais le niveau réel basé sur le score
        classe_finale = classe_predite
        niveau_final = niveaux.get(classe_finale, "inconnu")
        couleur_finale = couleurs.get(classe_finale, "#6b7280")

        return {
            "proprietaire_id": proprietaire_id,
            "score": score_reel,
            "classe": classe_finale,
            "niveau": niveau_final,
            "couleur": couleur_finale,
            "probabilites": prob_dict,
            "features": features,
        }