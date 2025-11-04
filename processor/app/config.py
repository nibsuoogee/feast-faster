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
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]
    CORS_HEADERS: list[str] = ["*"]
    CORS_METHODS: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
logger = logging
