from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration loaded exclusively on the backend."""

    model_config = SettingsConfigDict(
        env_file=(REPOSITORY_ROOT / ".env", REPOSITORY_ROOT / "backend" / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Ask Omkar AI"
    app_version: str = "1.0.0"
    environment: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"

    portfolio_data_path: Path = REPOSITORY_ROOT / "data" / "portfolio.json"
    resume_path: Path = REPOSITORY_ROOT / "src" / "assets" / "Resume.pdf"
    public_resume_url: str = "/assets/Resume.pdf"
    portfolio_url: str = "http://localhost:5173"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cors_allow_credentials: bool = False
    trust_proxy_headers: bool = False

    max_chat_chars: int = Field(default=4000, ge=100, le=20000)
    max_history_messages: int = Field(default=8, ge=0, le=20)
    max_jd_chars: int = Field(default=12000, ge=500, le=50000)
    rag_top_k: int = Field(default=5, ge=1, le=12)
    rag_min_score: float = Field(default=0.08, ge=0, le=1)

    enable_semantic_rag: bool = False
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_local_files_only: bool = True
    embedding_cache_folder: Path | None = None

    hf_gradio_space_id: str | None = None
    hf_gradio_api_name: str = "/generate"
    hf_token: SecretStr | None = None
    hf_gradio_timeout_seconds: float = Field(default=180.0, ge=10, le=600)
    llm_max_tokens: int = Field(default=384, ge=64, le=512)
    llm_temperature: float = Field(default=0.2, ge=0, le=1)

    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_sender_email: str | None = None
    smtp_sender_name: str = "Omkar Mahabdi"
    contact_recipient_email: str | None = None
    smtp_use_starttls: bool = True
    smtp_use_ssl: bool = False
    smtp_timeout_seconds: float = Field(default=15.0, ge=2, le=60)

    chat_rate_limit: int = Field(default=30, ge=1, le=1000)
    jd_rate_limit: int = Field(default=10, ge=1, le=1000)
    email_rate_limit: int = Field(default=3, ge=1, le=100)
    contact_rate_limit: int = Field(default=5, ge=1, le=100)
    standard_rate_window_seconds: int = Field(default=60, ge=1, le=3600)
    sensitive_rate_window_seconds: int = Field(default=3600, ge=60, le=86400)

    @property
    def allowed_origins(self) -> list[str]:
        origins = [item.strip() for item in self.cors_origins.split(",") if item.strip()]
        return origins or ["http://localhost:5173"]

    @property
    def email_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_sender_email)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
