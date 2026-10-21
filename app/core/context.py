"""Contextual memory manager supporting Redis with automatic in-memory fallback."""

import json
import logging
import time
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("chatbot.context")

# In-memory session fallback store: {session_id: {"data": ctx, "expires_at": timestamp}}
_local_memory_store: Dict[str, Dict[str, Any]] = {}
_redis_client = None
_redis_available = False

try:
    import redis
    _client = redis.from_url(settings.redis_url, socket_timeout=1.5, socket_connect_timeout=1.5)
    _client.ping()
    _redis_client = _client
    _redis_available = True
    logger.info("Connected to Redis successfully.")
except Exception as e:
    _redis_available = False
    logger.warning("Redis unavailable (%s). Falling back to resilient in-memory session store.", e)


def get_empty_context() -> Dict[str, Any]:
    """Returns an initialized empty conversation context."""
    return {
        "turns": [],
        "slots": {},
        "last_intent": None,
        "fallbacks": 0,
        "negative_turns": 0,
        "created_at": time.time(),
        "updated_at": time.time(),
    }


def load(session_id: str) -> Dict[str, Any]:
    """Loads session context from Redis or local in-memory fallback."""
    if _redis_available and _redis_client:
        try:
            raw = _redis_client.get(f"ctx:{session_id}")
            if raw:
                return json.loads(raw)
        except Exception as e:
            logger.error("Error reading from Redis for session %s: %s", session_id, e)

    # In-memory fallback
    now = time.time()
    record = _local_memory_store.get(session_id)
    if record:
        if record["expires_at"] > now:
            return record["data"]
        else:
            del _local_memory_store[session_id]

    return get_empty_context()


def save(session_id: str, ctx: Dict[str, Any]) -> None:
    """Saves session context with rolling TTL and maximum turn history limit."""
    # Enforce maximum turn history
    ctx["turns"] = ctx.get("turns", [])[-settings.max_turns:]
    ctx["updated_at"] = time.time()

    if _redis_available and _redis_client:
        try:
            _redis_client.setex(
                f"ctx:{session_id}",
                settings.redis_ttl_seconds,
                json.dumps(ctx)
            )
            return
        except Exception as e:
            logger.error("Error writing to Redis for session %s: %s", session_id, e)

    # Fallback storage
    _local_memory_store[session_id] = {
        "data": ctx,
        "expires_at": time.time() + settings.redis_ttl_seconds
    }


def clear(session_id: str) -> bool:
    """Removes a session context completely for privacy compliance."""
    cleared = False
    if _redis_available and _redis_client:
        try:
            _redis_client.delete(f"ctx:{session_id}")
            cleared = True
        except Exception as e:
            logger.error("Error deleting session %s from Redis: %s", session_id, e)

    if session_id in _local_memory_store:
        del _local_memory_store[session_id]
        cleared = True

    return cleared


def resolve_followup(text: str, ctx: Dict[str, Any]) -> Optional[str]:
    """
    Resolves conversational follow-up questions when a short or ambiguous phrase is sent.
    Example: 'And what about tomorrow?' -> reuses ctx['last_intent']
    """
    words = text.strip().split()
    if not ctx.get("last_intent"):
        return None

    # Condition 1: Short utterance (<= 4 words)
    if len(words) <= 4:
        # Check if words indicate continuation
        first_word = words[0].lower() if words else ""
        if first_word in {"what", "and", "how", "why", "when", "also", "yes", "no"}:
            return ctx["last_intent"]

    # Condition 2: Follow-up phrase starters
    followup_starters = ("what about", "how about", "and for", "tell me about that", "same for")
    if any(text.lower().startswith(starter) for starter in followup_starters):
        return ctx["last_intent"]

    return None
