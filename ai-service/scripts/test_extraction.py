# scripts/test_extraction.py
"""
Script de vérification manuelle de la Phase 1.
Lance-le après avoir démarré le backend Spring Boot et configuré .env :

    python scripts/test_extraction.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.data.extraction import DataExtractor  # noqa: E402


def main():
    extractor = DataExtractor()

    print("→ Test de connexion / authentification...")
    if not extractor.check_connection():
        print("❌ Connexion échouée. Vérifie SPRING_BOOT_URL et les identifiants dans .env")
        return
    print("✅ Connexion OK\n")

    datasets = {
        "Recettes": extractor.get_recettes,
        "Paiements": extractor.get_paiements,
        "Propriétaires": extractor.get_proprietaires,
        "Avis TIB": extractor.get_avis_tib,
        "Avis TNB": extractor.get_avis_tnb,
    }

    for label, fn in datasets.items():
        try:
            df = fn()
            print(f"{label:15s} → {len(df):5d} lignes, colonnes: {list(df.columns)}")
        except Exception as e:
            print(f"{label:15s} → ❌ ERREUR: {e}")


if __name__ == "__main__":
    main()
