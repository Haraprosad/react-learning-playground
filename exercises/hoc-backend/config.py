from pydantic_settings import BaseSettings
from typing import List, Optional
import os
import json

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # MongoDB Configuration
    MONGODB_URL: str
    DATABASE_NAME: str
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 100
    MONGODB_CONNECT_TIMEOUT_MS: int = 5000
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 5000
    
    # Security
    SECRET_KEY: str
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None  # For cloud deployment
    
    # CORS Configuration
    FRONTEND_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    PASSWORD_RESET_RATE_LIMIT: int = 3  # Per hour
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or text
    
    # Sentry (Error Tracking)
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: Optional[str] = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    API_TITLE: str = "HOC Authentication API"
    API_VERSION: str = "1.0.0"
    
    # Token Configuration
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def firebase_credentials(self) -> dict:
        """Get Firebase credentials from file or JSON string"""
        if self.FIREBASE_CREDENTIALS_JSON:
            return json.loads(self.FIREBASE_CREDENTIALS_JSON)
        elif self.FIREBASE_CREDENTIALS_PATH:
            with open(self.FIREBASE_CREDENTIALS_PATH, 'r') as f:
                return json.load(f)
        else:
            # Fallback to default path
            with open('serviceAccountKey.json', 'r') as f:
                return json.load(f)
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

settings = Settings()

# Export commonly used settings
MONGODB_URL = settings.MONGODB_URL
DATABASE_NAME = settings.DATABASE_NAME
SECRET_KEY = settings.SECRET_KEY
FRONTEND_URL = settings.FRONTEND_URL