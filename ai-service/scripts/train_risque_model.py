#!/usr/bin/env python3
"""
Script d'entraînement standalone du modèle de risque.
Usage :
    cd ai-service
    python scripts/train_risque_model.py
    python scripts/train_risque_model.py --force
"""
import argparse
import json
import sys
import logging
from pathlib import Path

# Ajouter le chemin parent pour importer app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.risque_retard import RisqueRetardModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Entraîne le modèle de scoring de risque")
    parser.add_argument("--force", action="store_true", help="Forcer la réentraînement")
    args = parser.parse_args()

    print("🚀 Lancement de l'entraînement...")
    try:
        model = RisqueRetardModel()
        result = model.train(force=args.force)
        print("\n✅ Entraînement terminé avec succès")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"\n❌ Erreur lors de l'entraînement : {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()