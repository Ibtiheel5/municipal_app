# app/schemas/prevision.py
from typing import List
from pydantic import BaseModel


class PrevisionTrainResponse(BaseModel):
    status: str
    n_observations: int
    start_date: str
    end_date: str
    aic: float = None
    bic: float = None


class HistoryData(BaseModel):
    dates: List[str]
    values: List[float]


class ForecastData(BaseModel):
    dates: List[str]
    values: List[float]


class SummaryData(BaseModel):
    total_historique: float
    moyenne_mensuelle_historique: float
    total_prevu: float
    moyenne_mensuelle_prevue: float


class PrevisionResponse(BaseModel):
    history: HistoryData
    forecast: ForecastData
    summary: SummaryData