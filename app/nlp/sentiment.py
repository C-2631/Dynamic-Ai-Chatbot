"""Sentiment and emotion analysis module using VADER."""

from typing import Dict, Any

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _analyzer = SentimentIntensityAnalyzer()
except ImportError:
    _analyzer = None

# Urgent / angry emotional indicators
URGENT_KEYWORDS = {
    "furious", "angry", "terrible", "horrible", "unacceptable",
    "scam", "ridiculous", "lawsuit", "awful", "worst", "fraud"
}


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes sentiment polarity and tone of the user's message.
    Returns:
    - label: 'positive' | 'negative' | 'neutral'
    - score: compound score between -1.0 and +1.0
    - is_urgent: boolean flag for escalation trigger
    """
    if not text.strip():
        return {"label": "neutral", "score": 0.0, "is_urgent": False}

    if _analyzer is not None:
        scores = _analyzer.polarity_scores(text)
        compound = float(scores["compound"])
    else:
        # Fallback keyword scorer if vaderSentiment is not present
        compound = 0.0
        words = text.lower().split()
        pos = sum(1 for w in words if w in {"good", "great", "excellent", "thanks", "helpful", "love"})
        neg = sum(1 for w in words if w in {"bad", "poor", "hate", "slow", "broken", "angry"})
        if pos > neg:
            compound = 0.5
        elif neg > pos:
            compound = -0.5

    # Thresholding as defined in Section 9 of the system specification
    if compound >= 0.35:
        label = "positive"
    elif compound <= -0.35:
        label = "negative"
    else:
        label = "neutral"

    # Detect urgency or severe frustration
    text_lower = text.lower()
    has_urgent_keyword = any(kw in text_lower for kw in URGENT_KEYWORDS)
    is_urgent = (compound <= -0.6) or has_urgent_keyword

    return {
        "label": label,
        "score": round(compound, 3),
        "is_urgent": is_urgent,
    }
