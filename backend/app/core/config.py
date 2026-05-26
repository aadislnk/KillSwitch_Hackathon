from __future__ import annotations

from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized config for the backend.

    We keep settings strongly-typed and sourced from environment variables.
    In production, these come from your deployment environment; locally, from `.env`.
    """

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = Field(default="development", validation_alias="APP_ENV")
    app_name: str = Field(default="KillSwitch API", validation_alias="APP_NAME")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="API_V1_PREFIX")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    host: str = Field(default="127.0.0.1", validation_alias="HOST")
    port: int = Field(default=8000, validation_alias="PORT")

    supabase_url: str | None = Field(default=None, validation_alias="SUPABASE_URL")
    supabase_anon_key: str | None = Field(default=None, validation_alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str | None = Field(
        default=None, validation_alias="SUPABASE_SERVICE_ROLE_KEY"
    )

    scheduler_timezone: str = Field(default="UTC", validation_alias="SCHEDULER_TIMEZONE")

    openai_api_key: str | None = Field(default=None, validation_alias="OPENAI_API_KEY")
    anthropic_api_key: str | None = Field(default=None, validation_alias="ANTHROPIC_API_KEY")

    @computed_field
    @property
    def has_supabase_config(self) -> bool:
        """True when the backend can create a Supabase client."""

        return bool(self.supabase_url and (self.supabase_service_role_key or self.supabase_anon_key))


@lru_cache
def get_settings() -> Settings:
    """Reusable settings loader for routes, services, scripts, and tests."""

    return Settings()


settings = get_settings()
