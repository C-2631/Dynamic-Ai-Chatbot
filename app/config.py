"""Configuration loader for Dynamic AI Chatbot using pydantic-settings."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Core app settings
    project_name: str = "Dynamic AI Chatbot"
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # CORS origins
    allowed_origins: str = "http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000,http://127.0.0.1:5500,*"

    # Redis Cache & Sessions (Falls back to in-memory store if unavailable)
    redis_url: str = "redis://localhost:6379/0"
    redis_ttl_seconds: int = 1800  # 30 minutes
    max_turns: int = 10

    # Relational Database (Defaults to SQLite; switches to PostgreSQL seamlessly)
    database_url: str = "sqlite:///./chatbot.db"

    # Generative LLM Settings (Groq, OpenRouter, Mock)
    llm_provider: str = "openrouter"  # "openrouter", "groq", "mock"
    llm_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    default_llm_model: str = "minimax/minimax-m3.1-flash:free"
    openrouter_site_url: str = "http://localhost:3000"
    openrouter_app_name: str = "Dynamic AI Chatbot"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 1500

    # Multi-platform secrets
    telegram_bot_token: str = ""
    slack_signing_secret: str = ""
    slack_bot_token: str = ""
    whatsapp_verify_token: str = ""

    # Security
    analytics_api_key: str = "dev_analytics_secret_key"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.allowed_origins or self.allowed_origins == "*":
            return ["*"]
        return [orig.strip() for orig in self.allowed_origins.split(",") if orig.strip()]


settings = Settings()
from typing import Dict, Any

AVAILABLE_MODELS: List[Dict[str, Any]] = [
    {
        "id": "minimax/minimax-m3.1-flash:free",
        "name": "MiniMax M3.1 Flash",
        "provider": "openrouter",
        "badge": "Free",
        "description": "1M token context, high-speed multimodal reasoning & agentic tasks",
        "category": "openrouter",
        "icon": "sparkles"
    },
    {
        "id": "nvidia/nemotron-3.5-super-vl:free",
        "name": "NVIDIA Nemotron 3.5 Super VL",
        "provider": "openrouter",
        "badge": "Free",
        "description": "Vision-language reasoning, complex logic & document analysis",
        "category": "openrouter",
        "icon": "shield"
    },
    {
        "id": "nvidia/nemotron-3.5-lightning:free",
        "name": "NVIDIA Nemotron 3.5 Lightning",
        "provider": "openrouter",
        "badge": "Free",
        "description": "Ultra-fast NVIDIA MoE architecture for instantaneous answers",
        "category": "openrouter",
        "icon": "zap"
    },
    {
        "id": "google/gemma-4-26b-a4b:free",
        "name": "Google Gemma 4 26B A4B",
        "provider": "openrouter",
        "badge": "Free",
        "description": "Google open weights 26B model for deep analytical intelligence",
        "category": "openrouter",
        "icon": "cpu"
    },
    {
        "id": "llama-3.3-70b-versatile",
        "name": "Groq Llama 3.3 70B",
        "provider": "groq",
        "badge": "Groq LPUs",
        "description": "Meta Llama 3.3 70B powered by Groq LPUs at ~300 tokens/sec",
        "category": "groq",
        "icon": "flame"
    },
    {
        "id": "llama-3.1-8b-instant",
        "name": "Groq Llama 3.1 8B Instant",
        "provider": "groq",
        "badge": "Groq Instant",
        "description": "Sub-100ms ultra-low latency conversational speed",
        "category": "groq",
        "icon": "gauge"
    }
]
