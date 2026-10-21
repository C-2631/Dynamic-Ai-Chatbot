"""Telegram Bot Webhook Adapter."""

from typing import Dict, Any, Optional, Tuple


def parse_telegram_update(payload: Dict[str, Any]) -> Optional[Tuple[str, str, str]]:
    """
    Extracts session_id, user_text, and chat_id from Telegram webhook payload.
    Returns (session_id, user_text, raw_chat_id) or None if not a valid text message.
    """
    message = payload.get("message") or payload.get("edited_message")
    if not message:
        return None

    text = message.get("text")
    chat = message.get("chat", {})
    chat_id = str(chat.get("id", ""))

    if not text or not chat_id:
        return None

    session_id = f"tg_{chat_id}"
    return session_id, text, chat_id


def format_telegram_reply(chat_id: str, reply_text: str) -> Dict[str, Any]:
    """Prepares payload to send back to Telegram Bot API sendMessage endpoint."""
    return {
        "chat_id": chat_id,
        "text": reply_text,
        "parse_mode": "HTML"
    }
