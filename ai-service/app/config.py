# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    spring_boot_url: str = os.getenv("SPRING_BOOT_URL", "http://localhost:8081")
    ai_service_email: str = os.getenv("AI_SERVICE_EMAIL", "")
    ai_service_password: str = os.getenv("AI_SERVICE_PASSWORD", "")
    ai_service_port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))


settings = Settings()
