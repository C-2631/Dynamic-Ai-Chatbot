"""Named Entity Recognition (NER) and custom pattern slot extraction."""

import re
from typing import Dict, Any

# Try loading spaCy, provide graceful fallback if model isn't found
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = None
except ImportError:
    nlp = None

# Custom regular expressions for business entities
ORDER_ID_REGEX = re.compile(r"\b(?:ORD|order)[-#\s]?(\d{5,10})\b", re.IGNORECASE)
GENERIC_NUMERIC_ID = re.compile(r"\b#?(\d{6,10})\b")
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")
PHONE_REGEX = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")


def extract_entities(text: str) -> Dict[str, Any]:
    """
    Extracts named entities using spaCy NER combined with domain-specific regex extractors.
    Fills key business slots: ORDER_ID, EMAIL, PHONE, DATE, MONEY, GPE, PERSON.
    """
    ents: Dict[str, Any] = {}

    # 1. Custom Regex Matchers
    # Order ID
    order_match = ORDER_ID_REGEX.search(text)
    if order_match:
        ents["ORDER_ID"] = f"ORD-{order_match.group(1)}"
    else:
        # Check generic numeric id if 'order' or 'package' is in text
        if any(w in text.lower() for w in ["order", "package", "track", "delivery", "item"]):
            gen_match = GENERIC_NUMERIC_ID.search(text)
            if gen_match:
                ents["ORDER_ID"] = f"ORD-{gen_match.group(1)}"

    # Email
    email_match = EMAIL_REGEX.search(text)
    if email_match:
        ents["EMAIL"] = email_match.group(0)

    # Phone
    phone_match = PHONE_REGEX.search(text)
    if phone_match:
        ents["PHONE"] = phone_match.group(0)

    # 2. SpaCy NER Pipeline
    if nlp is not None:
        try:
            doc = nlp(text)
            for ent in doc.ents:
                label = ent.label_
                val = ent.text.strip()
                if label in ["DATE", "TIME", "MONEY", "GPE", "PERSON", "ORG"]:
                    ents[label] = val
        except Exception:
            pass

    return ents
