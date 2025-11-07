# processor/app/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Meeting Proposal API"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]
    CORS_HEADERS: list[str] = ["*"]
    CORS_METHODS: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()