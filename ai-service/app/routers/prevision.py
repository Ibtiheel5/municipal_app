# app/routers/prevision.py
from fastapi import APIRouter, HTTPException, Query
from app.models.prevision_recettes import PrevisionRecettesModel
from app.schemas.prevision import PrevisionTrainResponse, PrevisionResponse

router = APIRouter(prefix="/api/ai/prevision", tags=["prevision"])
_model = PrevisionRecettesModel()


@router.post("/train", response_model=PrevisionTrainResponse)
def train_prevision(force: bool = Query(False)):
    try:
        return _model.train(force=force)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("", response_model=PrevisionResponse)
def get_prevision(steps: int = Query(12, ge=1, le=24)):
    try:
        return _model.predict(steps=steps)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")