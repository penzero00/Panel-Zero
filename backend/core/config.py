from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # API
    DEBUG: bool = True
    API_TITLE: str = "PanelZero API"
    API_VERSION: str = "0.1.0"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str

    # AI API Keys
    BYTEZ_API_KEY: str
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_FLASH_MODEL: str = "gemini-1.5-flash"
    GEMINI_PRO_MODEL: str = "gemini-1.5-pro"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Storage
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = [".docx", ".pdf"]
    STORAGE_BUCKET_NAME: str = "thesis-drafts"
    FILE_RETENTION_HOURS: int = 1
    
    # Security
    ENFORCE_RLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()