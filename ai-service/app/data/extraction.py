# app/data/extraction.py
"""
Récupère les données du backend Spring Boot (endpoints /api/admin/ai/export/**)
et les renvoie sous forme de DataFrames pandas, prêts à être utilisés par les
modules de feature engineering (Phase 2+).

Usage :
    from app.data.extraction import DataExtractor
    extractor = DataExtractor()
    df_recettes = extractor.get_recettes()
"""
import time
from typing import Optional

import pandas as pd
import requests

from app.config import settings


class AuthenticationError(Exception):
    pass


class DataExtractor:
    def __init__(self):
        self._token: Optional[str] = None
        self._token_expiry: float = 0.0
        # Le JWT de ton AuthService n'a pas de durée courte particulière,
        # mais on se re-authentifie toutes les 20 minutes par prudence.
        self._token_ttl_seconds = 20 * 60

    # ── Authentification ──────────────────────────────────────────────
    def _login(self) -> str:
        if not settings.ai_service_email or not settings.ai_service_password:
            raise AuthenticationError(
                "AI_SERVICE_EMAIL / AI_SERVICE_PASSWORD non configurés dans .env"
            )
        url = f"{settings.spring_boot_url}/api/auth/login"
        response = requests.post(
            url,
            json={
                "email": settings.ai_service_email,
                "password": settings.ai_service_password,
            },
            timeout=10,
        )
        if response.status_code != 200:
            raise AuthenticationError(
                f"Échec de connexion au backend ({response.status_code}): {response.text}"
            )
        data = response.json()
        token = data.get("token")
        if not token:
            raise AuthenticationError("Réponse de login sans champ 'token'.")
        return token

    def _get_token(self) -> str:
        now = time.time()
        if self._token is None or now >= self._token_expiry:
            self._token = self._login()
            self._token_expiry = now + self._token_ttl_seconds
        return self._token

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self._get_token()}"}

    # ── Appel générique ──────────────────────────────────────────────
    def _get(self, path: str) -> list:
        url = f"{settings.spring_boot_url}{path}"
        response = requests.get(url, headers=self._headers(), timeout=30)
        if response.status_code == 401:
            # Token expiré côté serveur avant l'échéance locale : on retente une fois.
            self._token = None
            response = requests.get(url, headers=self._headers(), timeout=30)
        response.raise_for_status()
        return response.json()

    # ── Endpoints d'export ───────────────────────────────────────────
    def get_recettes(self) -> pd.DataFrame:
        data = self._get("/api/admin/ai/export/recettes")
        return pd.DataFrame(data)

    def get_paiements(self) -> pd.DataFrame:
        data = self._get("/api/admin/ai/export/paiements")
        return pd.DataFrame(data)

    def get_proprietaires(self) -> pd.DataFrame:
        data = self._get("/api/admin/ai/export/proprietaires")
        return pd.DataFrame(data)

    def get_avis_tib(self) -> pd.DataFrame:
        data = self._get("/api/admin/ai/export/avis-tib")
        return pd.DataFrame(data)

    def get_avis_tnb(self) -> pd.DataFrame:
        data = self._get("/api/admin/ai/export/avis-tnb")
        return pd.DataFrame(data)

    def check_connection(self) -> bool:
        """Utilisé par /health pour vérifier que le backend est joignable et
        que les identifiants du compte de service sont valides."""
        try:
            self._get_token()
            return True
        except Exception:
            return False
