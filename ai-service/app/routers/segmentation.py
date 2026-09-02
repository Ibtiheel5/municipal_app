# app/routers/segmentation.py
from fastapi import APIRouter, HTTPException, Query
from app.models.segmentation import SegmentationModel

router = APIRouter(prefix="/api/ai/segmentation", tags=["segmentation"])
_model = SegmentationModel()


@router.post("/train")
def train_segmentation(force: bool = Query(False)):
    try:
        return _model.train(force=force)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("")
def get_segments():
    try:
        return _model.segment()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/{proprietaire_id}")
def get_segment_by_id(proprietaire_id: int):
    try:
        return _model.segment(proprietaire_id=proprietaire_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")