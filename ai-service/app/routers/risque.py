"""
Phase 2 — Scoring de risque de retard/impayé.
Endpoints :
  GET  /api/ai/risque/{proprietaire_id}   → score individuel
  POST /api/ai/risque/train               → entraînement du modèle
"""
from fastapi import APIRouter, HTTPException

from app.models.risque_retard import RisqueRetardModel
from app.schemas.risque import RisqueResponse, TrainResponse

router = APIRouter(prefix="/api/ai/risque", tags=["risque"])

_model = RisqueRetardModel()


@router.get("/{proprietaire_id}", response_model=RisqueResponse)
def get_risque(proprietaire_id: int):
    """
    Retourne le score de risque (0-100) pour un propriétaire donné.
    Nécessite que le modèle ait été entraîné au préalable (POST /train).
    """
    try:
        return _model.predict_for_proprietaire(proprietaire_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.post("/train", response_model=TrainResponse)
def train_risque(force: bool = False):
    """
    Entraîne (ou réentraîne) le modèle de risque sur les données
    actuelles du backend Spring Boot.
    """
    try:
        return _model.train(force=force)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'entraînement: {str(e)}")