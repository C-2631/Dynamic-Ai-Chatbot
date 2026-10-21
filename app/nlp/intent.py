"""Intent classification and multi-intent segmentation engine."""

import json
import os
import re
from typing import List, Tuple, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Default Intent Priorities as specified in guide Section 6.3
PRIORITY: Dict[str, int] = {
    "human_handoff": 5,
    "refund": 4,
    "cancel_order": 4,
    "order_status": 3,
    "account_help": 3,
    "shipping_info": 2,
    "business_hours": 2,
    "greeting": 1,
}

# Regex to split multi-intent queries on conjunctions and punctuation boundaries
CONJUNCTION_SPLIT_REGEX = re.compile(
    r"\b(?:and\s+also|and\s+can\s+i|and\s+could\s+you|and|but|plus|also)\b|[;?!\n]+",
    re.IGNORECASE
)


class IntentClassifier:
    """Fast, deterministic TF-IDF + Logistic Regression Intent Classifier."""

    def __init__(self, data_path: str = "data/intents.json"):
        self.data_path = data_path
        self.vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        self.clf = LogisticRegression(C=10.0, max_iter=1000, random_state=42)
        self.classes_: List[str] = []
        self._trained = False
        self._train()

    def _train(self) -> None:
        if not os.path.exists(self.data_path):
            # Fallback path if run from subdirectory
            alt_path = os.path.join(os.path.dirname(__file__), "..", "..", self.data_path)
            if os.path.exists(alt_path):
                self.data_path = alt_path
            else:
                raise FileNotFoundError(f"Intent training file not found at {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        X: List[str] = []
        y: List[str] = []
        for intent, phrases in data.items():
            for phrase in phrases:
                X.append(phrase.lower().strip())
                y.append(intent)

        if not X:
            raise ValueError("No training data found in intents file")

        X_vec = self.vec.fit_transform(X)
        self.clf.fit(X_vec, y)
        self.classes_ = list(self.clf.classes_)
        self._trained = True

    def predict(self, text: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Predicts top intents with probability scores:
        Returns: [(intent_name, confidence_score), ...]
        """
        if not self._trained:
            raise RuntimeError("Classifier has not been trained")

        text_clean = text.lower().strip()
        if not text_clean:
            return [("greeting", 0.0)]

        features = self.vec.transform([text_clean])
        probs = self.clf.predict_proba(features)[0]
        ranked = sorted(zip(self.clf.classes_, probs), key=lambda p: -p[1])
        return [(str(intent), float(conf)) for intent, conf in ranked[:top_k]]

    def segment_query(self, text: str) -> List[str]:
        """
        Splits a compound message into logical clause segments.
        Example: 'Where is my order, and can I get a refund?'
        -> ['Where is my order', 'can I get a refund']
        """
        raw_segments = CONJUNCTION_SPLIT_REGEX.split(text)
        cleaned = [seg.strip(" ,.-") for seg in raw_segments if len(seg.strip(" ,.-")) > 2]
        return cleaned if cleaned else [text.strip()]

    def analyze_multi_intent(self, text: str) -> List[Dict[str, Any]]:
        """
        Identifies multiple intents across message segments, applying priority weights.
        Returns sorted segments by priority-weighted score.
        """
        segments = self.segment_query(text)
        results = []

        for seg in segments:
            preds = self.predict(seg, top_k=2)
            top_intent, top_conf = preds[0]
            priority_weight = PRIORITY.get(top_intent, 1)
            weighted_score = top_conf * priority_weight

            results.append({
                "segment": seg,
                "intent": top_intent,
                "confidence": round(top_conf, 4),
                "priority_weight": priority_weight,
                "weighted_score": round(weighted_score, 4),
                "secondary_intent": preds[1][0] if len(preds) > 1 else None
            })

        # Sort by weighted score descending
        return sorted(results, key=lambda r: -r["weighted_score"])
