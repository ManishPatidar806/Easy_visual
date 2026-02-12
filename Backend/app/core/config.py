from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    # API Configuration
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "EasyVisual"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "No-Code Machine Learning Pipeline Builder API"
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    RELOAD: bool = True
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    
    # Storage Configuration
    PIPELINE_STORAGE_PATH: str = "./pipelines"
    MAX_UPLOAD_SIZE: int = 52428800  # 50MB
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".xlsx", ".xls"]
    
    # ML Configuration
    RANDOM_STATE: int = 42
    MAX_FEATURES: int = 1000  # Maximum number of features allowed
    MAX_ROWS: int = 1000000  # Maximum number of rows allowed
    
    # Security
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    def ensure_directories(self):
        """Ensure required directories exist"""
        Path(self.PIPELINE_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
settings.ensure_directories()
