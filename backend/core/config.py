"""
Backend Configuration
Loads environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application configuration"""
    
    # API Configuration
    API_TITLE: str = "PanelZero API"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    
    # Google Gemini Configuration
    GEMINI_API_KEY: str
    GEMINI_FLASH_MODEL: str = "gemini-1.5-flash"
    GEMINI_PRO_MODEL: str = "gemini-1.5-pro"
    
    # Redis & Celery Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # File Storage Configuration
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list = ["docx"]
    STORAGE_BUCKET_NAME: str = "thesis-drafts"
    FILE_RETENTION_HOURS: int = 1
    
    # RLS (Row Level Security)
    ENFORCE_RLS: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Initialize settings
settings = Settings()
