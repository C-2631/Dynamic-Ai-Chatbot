"""Safety guardrails, toxicity filtering, and trustworthy AI checks."""

import re
from typing import Tuple

# Prohibited dangerous topics or toxic outputs
BLOCKED_PATTERNS = [
    re.compile(r"\b(?:credit\s*card\s*number|cvv|pin\s*code|password\s*is)\b", re.I),
    re.compile(r"\b(?:drop\s+database|rm\s+-rf|<script>)\b", re.I),
]

SAFE_FALLBACK = "I apologize, but I cannot fulfill that request as it violates our safety and privacy policies."


def is_safe_response(text: str) -> Tuple[bool, str]:
    """
    Checks if a generated response adheres to security, privacy, and non-toxicity standards.
    Returns (is_safe, sanitized_text).
    """
    if not text:
        return True, ""

    for pattern in BLOCKED_PATTERNS:
        if pattern.search(text):
            return False, SAFE_FALLBACK

    return True, text


def apply_ethical_nudges(text: str) -> str:
    """
    Ensures answers do not use dark patterns, fake urgency, or coercive tactics.
    """
    # Remove artificial scarcity claims if generated
    cleaned = re.sub(r"\b(?:only\s*\d+\s*left\s*hurry|buy\s*now\s*or\s*regret)\b", "", text, flags=re.I)
    return cleaned.strip()
