from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from urllib.parse import urlparse

class Settings(BaseSettings):
    # API
    DEBUG: bool = True
    API_TITLE: str = "PanelZero API"
    API_VERSION: str = "0.1.0"

    # Supabase (optional for testing)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    # Azure OpenAI Configuration
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_MODEL: str = "gpt-5.2-chat"

    # Storage
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = [".docx"]
    STORAGE_BUCKET_NAME: str = "thesis-drafts"
    FILE_RETENTION_HOURS: int = 1
    
    # Security
    ENFORCE_RLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    @property
    def AZURE_OPENAI_ENDPOINT_BASE(self) -> Optional[str]:
        """Extract base endpoint URL for Azure OpenAI SDK.
        
        For cognitiveservices.azure.com endpoints, return the base URL without path.
        The AzureOpenAI SDK will handle routing to chat completions API internally.
        """
        if not self.AZURE_OPENAI_ENDPOINT:
            return None
        parsed = urlparse(self.AZURE_OPENAI_ENDPOINT)
        # Return scheme + netloc (e.g., https://resource.cognitiveservices.azure.com)
        return f"{parsed.scheme}://{parsed.netloc}"

settings = Settings()