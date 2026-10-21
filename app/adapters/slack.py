"""Slack Events API Webhook Adapter."""

from typing import Dict, Any, Optional, Tuple


def parse_slack_event(payload: Dict[str, Any]) -> Optional[Tuple[str, str, str]]:
    """
    Extracts session_id, text, and channel from Slack Events API payload.
    Ignores bot messages to prevent feedback loops.
    """
    event = payload.get("event", {})
    if not event:
        return None

    # Ignore bot's own messages or message edits
    if event.get("bot_id") or event.get("subtype"):
        return None

    text = event.get("text", "")
    channel = event.get("channel", "")
    user = event.get("user", "")

    if not text or not channel:
        return None

    session_id = f"slack_{channel}_{user}"
    return session_id, text, channel


def format_slack_reply(channel: str, reply_text: str) -> Dict[str, Any]:
    """Prepares payload to post to Slack chat.postMessage API."""
    return {
        "channel": channel,
        "text": reply_text
    }
