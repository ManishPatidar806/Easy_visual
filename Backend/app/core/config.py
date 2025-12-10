"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "ML Pipeline Builder"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "No-Code Machine Learning Pipeline Builder API"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ]
    
    # Storage Settings
    PIPELINE_STORAGE_PATH: str = "./pipelines"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # ML Settings
    RANDOM_STATE: int = 42
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
