import urllib.parse
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ImpactForge Backend"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "impactforge-jwt-secret-key-production-jharkhand-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/impactforge"

    # AI Configuration (ImpactForge Phase 1 Part 1 & Part 2)
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: Union[str, None] = None
    AI_MODEL: str = "gemini-3.6-flash"
    AI_FALLBACK_MODEL: str = "gemini-3.5-flash-lite"
    AI_ENABLED: bool = True

    # AI Embedding & Similarity Configuration (ImpactForge Phase 1 Part 3)
    AI_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    AI_EMBEDDING_MULTILINGUAL_MODEL: str = "BAAI/bge-m3"
    AI_EMBEDDING_ENABLED: bool = True
    SIMILARITY_THRESHOLD_POSSIBLE: float = 0.55
    SIMILARITY_THRESHOLD_STRONG: float = 0.75
    SIMILARITY_THRESHOLD_DUPLICATE: float = 0.85

    # CORS configuration for frontend
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def sanitize_database_url(cls, v: str) -> str:
        """Safely encode password in DATABASE_URL if it contains special characters."""
        if "://" not in v:
            return v
        scheme, rest = v.split("://", 1)
        if "@" in rest:
            userinfo, hostinfo = rest.rsplit("@", 1)
            if ":" in userinfo:
                user, pwd = userinfo.split(":", 1)
                encoded_pwd = urllib.parse.quote_plus(urllib.parse.unquote_plus(pwd))
                return f"{scheme}://{user}:{encoded_pwd}@{hostinfo}"
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v  # type: ignore[return-value]
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()

