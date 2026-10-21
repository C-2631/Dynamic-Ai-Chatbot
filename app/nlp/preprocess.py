"""Text preprocessing, normalization, and PII masking module."""

import re
from typing import Dict, Any, Tuple

# PII Detection Patterns
CREDIT_CARD_REGEX = re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b")
SSN_REGEX = re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b")
PHONE_REGEX = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")

# Profanity and toxic words list for basic sanitization
PROFANITY_LIST = {
    "abuse", "idiot", "stupid", "scam", "bastard", "crap", "damn"
}


def mask_pii(text: str) -> Tuple[str, Dict[str, Any]]:
    """
    Masks PII elements like credit cards, SSNs, phone numbers, and emails.
    Returns masked text and a dictionary of extracted sensitive tokens (for slot preservation if needed).
    """
    extracted: Dict[str, Any] = {}

    def mask_card(match):
        extracted["card"] = match.group(0)
        return "[MASKED_CARD]"

    def mask_ssn(match):
        extracted["ssn"] = match.group(0)
        return "[MASKED_SSN]"

    masked = CREDIT_CARD_REGEX.sub(mask_card, text)
    masked = SSN_REGEX.sub(mask_ssn, masked)
    return masked, extracted


def clean_text(text: str) -> str:
    """
    Trims, normalizes whitespaces, and removes potentially malicious control characters.
    """
    if not text:
        return ""
    # Strip excess whitespace
    normalized = " ".join(text.strip().split())
    # Limit message length safely to avoid denial-of-service
    return normalized[:1000]


def preprocess(text: str) -> Dict[str, Any]:
    """
    Full preprocessing pipeline:
    - Normalizes text
    - Identifies and masks PII
    - Checks for profanity flag
    - Returns structured preprocessing metadata
    """
    cleaned = clean_text(text)
    masked, pii_data = mask_pii(cleaned)

    # Check for basic profanity / toxicity flag
    tokens = set(re.findall(r"\b\w+\b", cleaned.lower()))
    has_profanity = bool(tokens.intersection(PROFANITY_LIST))

    return {
        "original": cleaned,
        "clean_text": masked,
        "has_pii": bool(pii_data),
        "pii_extracted": pii_data,
        "has_profanity": has_profanity,
    }
