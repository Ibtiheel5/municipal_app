# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, risque, prevision, anomalies, segmentation

app = FastAPI(
    title="Baladiya AI Service",
    description="Microservice IA/Data pour le module TIB/TNB — scoring de risque, "
                "prévision des recettes, détection d'anomalies, segmentation.",
    version="0.4.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(risque.router)
app.include_router(prevision.router)
app.include_router(anomalies.router)
app.include_router(segmentation.router)


@app.get("/")
def root():
    return {
        "service": "Baladiya AI Service",
        "status": "running",
        "version": "0.4.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "risque": "/api/ai/risque",
            "prevision": "/api/ai/prevision",
            "anomalies": "/api/ai/anomalies",
            "segmentation": "/api/ai/segmentation",
        },
    }