# processor/app/config.py
import os
import logging
from dotenv import load_dotenv
from pydantic_settings import BaseSettings


load_dotenv()  # For local development


class Settings(BaseSettings):
    APP_NAME: str = "Feast faster"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    OPEN_ROUTE_SERVICE_API_KEY: str = os.getenv("OPEN_ROUTE_SERVICE_API_KEY")
    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173", "https://app.localhost", "http://localhost:3000", "https://backend.localhost"
    ]
    CORS_HEADERS: list[str] = ["*"]
    CORS_METHODS: list[str] = ["POST", "GET", "OPTIONS", "PATCH", "PUT"]

    class Config:
        env_file = ".env"


settings = Settings()
logger = logging
