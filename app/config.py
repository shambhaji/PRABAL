from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "PGx Risk Prediction API"
    app_version: str = "1.0.0"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # LLM
    openai_api_key: str = ""
    openai_base_url: str = "https://api.groq.com/openai/v1"  # Default to Groq
    openai_model: str = "llama3-8b-8192"

    # Limits
    max_vcf_size_mb: int = 50

    @property
    def max_vcf_size_bytes(self) -> int:
        return self.max_vcf_size_mb * 1024 * 1024

    @property
    def active_llm_key(self) -> str:
        return self.openai_api_key

    @property
    def active_llm_model(self) -> str:
        return self.openai_model


@lru_cache()
def get_settings() -> Settings:
    return Settings()
