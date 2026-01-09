from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Personal Finance Manager API"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    DATABASE_URL: str = "sqlite:///./finance_manager.db"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    MAX_UPLOAD_SIZE: int = 5242880

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
