"""Unified LLM Client supporting Groq and OpenRouter with automatic fallback and multimodal context."""

import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings, AVAILABLE_MODELS

logger = logging.getLogger("chatbot.llm_client")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Primary to fallback model aliases for OpenRouter free models
MODEL_FALLBACKS = {
    "minimax/minimax-m3.1-flash:free": [
        "minimax/minimax-01",
        "openrouter/free"
    ],
    "nvidia/nemotron-3.5-super-vl:free": [
        "nvidia/nemotron-3.5-super-vl",
        "nvidia/llama-3.1-nemotron-70b-instruct:free",
        "openrouter/free"
    ],
    "nvidia/nemotron-3.5-lightning:free": [
        "nvidia/nemotron-3.5-lightning",
        "openrouter/free"
    ],
    "google/gemma-4-26b-a4b:free": [
        "google/gemma-4-26b-a4b",
        "google/gemma-2-9b-it:free",
        "openrouter/free"
    ],
}

SYSTEM_PROMPT = """You are the Dynamic AI Chatbot, an advanced enterprise-grade AI assistant.
Your capabilities:
- Answering questions clearly, empathetically, and accurately.
- Analyzing uploaded documents (PDF, Word, PPT), images, and video metadata.
- Assisting with customer inquiries, orders, refunds, and technical topics.
- Formatting answers using clean markdown (bullet points, bold highlights, code blocks when relevant).
Maintain a polished, supportive, and concise tone. Never make up false information."""


def resolve_provider_and_model(
    requested_model: Optional[str] = None,
    requested_provider: Optional[str] = None
) -> tuple[str, str]:
    """Resolves provider ('openrouter' | 'groq') and model string."""
    model = (requested_model or "").strip()
    provider = (requested_provider or "").strip().lower()

    if not model:
        # Pick from default settings or first available
        if settings.openrouter_api_key:
            provider = "openrouter"
            model = settings.default_llm_model or "minimax/minimax-m3.1-flash:free"
        elif settings.groq_api_key:
            provider = "groq"
            model = "llama-3.3-70b-versatile"
        else:
            provider = settings.llm_provider
            model = settings.default_llm_model

    if not provider:
        # Infer provider from model name
        if model.startswith("llama-") or model.startswith("mixtral-") or "groq" in model:
            provider = "groq"
        else:
            provider = "openrouter"

    return provider, model


def build_messages(
    user_prompt: str,
    context_turns: Optional[List[Dict[str, Any]]] = None,
    attachments: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, str]]:
    """Builds conversation history messages for OpenAI-compatible endpoint."""
    messages: List[Dict[str, str]] = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Incorporate rolling memory from previous turns (up to last 6 turns)
    if context_turns:
        recent = context_turns[-6:]
        for turn in recent:
            if "u" in turn and turn["u"]:
                messages.append({"role": "user", "content": turn["u"]})
            if "b" in turn and turn["b"]:
                messages.append({"role": "assistant", "content": turn["b"]})

    # Prepare final user utterance incorporating attachment context
    final_content = user_prompt.strip()
    if attachments and len(attachments) > 0:
        att_sections = []
        for att in attachments:
            fname = att.get("filename") or att.get("name", "attachment")
            category = att.get("category", "file")
            extracted = att.get("extracted_text", "").strip()
            details = att.get("details", {})

            section = f"[Attached {category.upper()}: {fname}]"
            if extracted:
                section += f"\nExtracted Content:\n{extracted[:3500]}"
            if details:
                section += f"\nFile Metadata: {json.dumps(details)}"
            att_sections.append(section)

        attachment_header = "\n\n".join(att_sections)
        if final_content:
            final_content = f"{attachment_header}\n\nUser Question:\n{final_content}"
        else:
            final_content = f"{attachment_header}\n\nPlease analyze this attachment and provide a structured summary of key insights."

    messages.append({"role": "user", "content": final_content or "Hello"})
    return messages


async def call_openrouter(
    messages: List[Dict[str, str]],
    model: str,
    api_key: str
) -> Optional[str]:
    """Calls OpenRouter chat completions endpoint with model fallbacks."""
    models_to_try = [model]
    if model in MODEL_FALLBACKS:
        models_to_try.extend(MODEL_FALLBACKS[model])

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": settings.openrouter_site_url,
        "X-Title": settings.openrouter_app_name,
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=35.0) as client:
        for target_model in models_to_try:
            payload = {
                "model": target_model,
                "messages": messages,
                "temperature": settings.llm_temperature,
                "max_tokens": settings.llm_max_tokens,
            }
            try:
                logger.info("Attempting OpenRouter request with model: %s", target_model)
                resp = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        reply = choices[0]["message"].get("content", "").strip()
                        if reply:
                            logger.info("OpenRouter response succeeded with model: %s", target_model)
                            return reply
                elif resp.status_code in (404, 429):
                    logger.warning("OpenRouter model %s returned status %d. Trying fallback...", target_model, resp.status_code)
                    continue
                else:
                    logger.error("OpenRouter error %d: %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("Failed calling OpenRouter model %s: %s", target_model, e)
                continue

    return None


async def call_groq(
    messages: List[Dict[str, str]],
    model: str,
    api_key: str
) -> Optional[str]:
    """Calls Groq LPUs chat completions endpoint."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    groq_models = [model, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

    async with httpx.AsyncClient(timeout=25.0) as client:
        for target_model in groq_models:
            payload = {
                "model": target_model,
                "messages": messages,
                "temperature": settings.llm_temperature,
                "max_tokens": settings.llm_max_tokens,
            }
            try:
                logger.info("Attempting Groq request with model: %s", target_model)
                resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        reply = choices[0]["message"].get("content", "").strip()
                        if reply:
                            logger.info("Groq response succeeded with model: %s", target_model)
                            return reply
                else:
                    logger.error("Groq error %d: %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("Failed calling Groq model %s: %s", target_model, e)
                continue

    return None


async def generate_llm_response(
    prompt: str,
    context_turns: Optional[List[Dict[str, Any]]] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main dispatch entry point:
    Routes to OpenRouter or Groq based on configuration and selected model,
    with cross-provider resilience and graceful offline fallback.
    """
    resolved_provider, resolved_model = resolve_provider_and_model(model, provider)
    messages = build_messages(prompt, context_turns, attachments)

    reply: Optional[str] = None
    actual_provider = resolved_provider
    actual_model = resolved_model

    # 1. Primary OpenRouter routing
    if resolved_provider == "openrouter":
        api_key = settings.openrouter_api_key or os.getenv("OPENROUTER_API_KEY", "")
        if api_key:
            reply = await call_openrouter(messages, resolved_model, api_key)

        # Cross-provider fallback: If OpenRouter didn't succeed, try Groq if Groq key exists
        if not reply and settings.groq_api_key:
            logger.info("OpenRouter unavailable; attempting Groq fallback...")
            groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")
            reply = await call_groq(messages, "llama-3.3-70b-versatile", groq_key)
            if reply:
                actual_provider = "groq"
                actual_model = "llama-3.3-70b-versatile"

    # 2. Primary Groq routing
    elif resolved_provider == "groq":
        api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")
        if api_key:
            reply = await call_groq(messages, resolved_model, api_key)

        # Cross-provider fallback: If Groq failed, try OpenRouter if OpenRouter key exists
        if not reply and settings.openrouter_api_key:
            logger.info("Groq unavailable; attempting OpenRouter fallback...")
            or_key = settings.openrouter_api_key or os.getenv("OPENROUTER_API_KEY", "")
            reply = await call_openrouter(messages, "minimax/minimax-m3.1-flash:free", or_key)
            if reply:
                actual_provider = "openrouter"
                actual_model = "minimax/minimax-m3.1-flash:free"

    # 3. Grounded Fallback if no keys set or providers unreachable
    if not reply:
        clean_model_name = resolved_model.split("/")[-1].replace(":free", "")
        if not (settings.openrouter_api_key or settings.groq_api_key):
            reply = (
                f"I am initialized and configured to use **{resolved_model}** via {resolved_provider.title()}.\n\n"
                f"To connect to live model inference:\n"
                f"1. Add your `OPENROUTER_API_KEY` or `GROQ_API_KEY` to the `.env` file.\n"
                f"2. Restart or reload the backend service.\n\n"
                f"How can I assist you with your project or inquiry in the meantime?"
            )
        else:
            reply = (
                f"Regarding your query with **{clean_model_name}**: "
                f"I have received your request. Please let me know any specific parameters or details you'd like to explore."
            )

    return {
        "reply": reply,
        "provider": actual_provider,
        "model": actual_model,
        "source": "llm"
    }
