from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "ML Pipeline Builder"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "No-Code Machine Learning Pipeline Builder API"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    
    PIPELINE_STORAGE_PATH: str = "./pipelines"
    MAX_UPLOAD_SIZE: int = 52428800
    
    RANDOM_STATE: int = 42
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
