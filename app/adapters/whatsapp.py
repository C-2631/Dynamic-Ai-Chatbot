"""WhatsApp Cloud API Webhook Adapter."""

from typing import Dict, Any, Optional, Tuple


def parse_whatsapp_message(payload: Dict[str, Any]) -> Optional[Tuple[str, str, str]]:
    """
    Extracts session_id, text, and sender phone number from WhatsApp Cloud API payload.
    """
    try:
        entries = payload.get("entry", [])
        if not entries:
            return None

        changes = entries[0].get("changes", [])
        if not changes:
            return None

        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            return None

        msg = messages[0]
        if msg.get("type") != "text":
            return None

        text = msg.get("text", {}).get("body", "")
        sender = msg.get("from", "")

        if not text or not sender:
            return None

        session_id = f"wa_{sender}"
        return session_id, text, sender
    except Exception:
        return None


def format_whatsapp_reply(recipient_phone: str, reply_text: str) -> Dict[str, Any]:
    """Prepares payload to send back to WhatsApp Cloud API messages endpoint."""
    return {
        "messaging_product": "whatsapp",
        "to": recipient_phone,
        "type": "text",
        "text": {"body": reply_text}
    }
