# app/routers/anomalies.py
from fastapi import APIRouter, HTTPException, Query
from app.models.anomalies import AnomalyDetectionModel

router = APIRouter(prefix="/api/ai/anomalies", tags=["anomalies"])
_model = AnomalyDetectionModel()


@router.post("/train")
def train_anomalies(force: bool = Query(False)):
    try:
        return _model.train(force=force)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("")
def detect_anomalies(limit: int = Query(50, ge=1, le=100)):
    try:
        return _model.detect(limit=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/{avis_id}")
def detect_anomaly_by_id(avis_id: int):
    try:
        return _model.detect(avis_id=avis_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")