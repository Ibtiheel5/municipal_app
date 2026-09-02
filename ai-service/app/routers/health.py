# app/routers/health.py
from fastapi import APIRouter

from app.data.extraction import DataExtractor

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health():
    """Vérifie que le microservice tourne."""
    return {"status": "ok", "service": "ai-service"}


@router.get("/backend")
def health_backend():
    """Vérifie que le backend Spring Boot est joignable et que le compte
    de service ai-service peut s'authentifier."""
    extractor = DataExtractor()
    connected = extractor.check_connection()
    return {
        "backend_reachable": connected,
        "message": "Connexion au backend OK" if connected
        else "Impossible de se connecter au backend — vérifie SPRING_BOOT_URL "
             "et AI_SERVICE_EMAIL/PASSWORD dans .env",
    }


@router.get("/dataset")
def health_dataset():
    """Récupère un échantillon de chaque dataset pour vérifier que le
    pipeline d'extraction fonctionne de bout en bout."""
    extractor = DataExtractor()
    result = {}
    for name, fn in [
        ("recettes", extractor.get_recettes),
        ("paiements", extractor.get_paiements),
        ("proprietaires", extractor.get_proprietaires),
        ("avis_tib", extractor.get_avis_tib),
        ("avis_tnb", extractor.get_avis_tnb),
    ]:
        try:
            df = fn()
            result[name] = {"rows": len(df), "columns": list(df.columns)}
        except Exception as e:
            result[name] = {"error": str(e)}
    return result
