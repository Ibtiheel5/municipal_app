"""
Schémas Pydantic pour l'endpoint /api/ai/risque
"""
from typing import Dict

from pydantic import BaseModel


class RisqueResponse(BaseModel):
    proprietaire_id: int
    score: int                    # 0-100
    classe: int                   # 0,1,2,3
    niveau: str                   # faible/moyen/eleve/critique
    couleur: str                  # code hex couleur
    probabilites: Dict[str, float]
    features: Dict[str, float]


class TrainResponse(BaseModel):
    status: str
    train_accuracy: float
    test_accuracy: float
    nb_samples: int
    feature_importance: Dict[str, float]
    model_path: str