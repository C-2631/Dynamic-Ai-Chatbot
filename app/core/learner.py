"""Self-learning response selector using an Epsilon-Greedy Contextual Bandit."""

import random
import json
import os
import logging
from collections import defaultdict
from typing import Dict, List, Any

logger = logging.getLogger("chatbot.learner")

# Default response variants per intent for bandit exploration
DEFAULT_VARIANTS: Dict[str, List[str]] = {
    "greeting": [
        "Hello! How can I help you today?",
        "Hi there! What can I assist you with right now?",
        "Greetings! Feel free to ask about your orders, returns, or account."
    ],
    "business_hours": [
        "Our customer support desk is open Monday through Friday from 8:00 AM to 8:00 PM EST, and Saturday 9:00 AM to 5:00 PM EST.",
        "We are available Mon-Fri 8am-8pm EST and Saturday 9am-5pm EST. Our automated assistant is available 24/7."
    ],
    "shipping_info": [
        "We offer Standard Delivery (3-5 business days) for $4.99 or free over $50, and Express Shipping (1-2 days) for $12.99.",
        "Standard shipping takes 3-5 business days. Express shipping delivers within 1-2 business days across all contiguous states."
    ]
}


class ResponseBandit:
    """
    Epsilon-greedy selection over response variants per intent.
    Learns dynamically from user feedback (thumbs up = 1, thumbs down = 0).
    """

    def __init__(self, epsilon: float = 0.15, storage_path: str = "data/bandit_state.json"):
        self.eps = epsilon
        self.storage_path = storage_path
        # intent -> variant -> count
        self.wins: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self.shows: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._load_state()

    def choose(self, intent: str, variants: List[str]) -> str:
        """Picks a response variant using epsilon-greedy exploration/exploitation."""
        if not variants:
            return ""

        if len(variants) == 1:
            return variants[0]

        # Exploration
        if random.random() < self.eps:
            return random.choice(variants)

        # Exploitation (Laplace smoothed win-rate)
        return max(
            variants,
            key=lambda v: (self.wins[intent][v] + 1.0) / (self.shows[intent][v] + 2.0)
        )

    def record_show(self, intent: str, variant: str) -> None:
        """Registers that a variant was shown to a user."""
        self.shows[intent][variant] += 1

    def update(self, intent: str, variant: str, reward: int) -> None:
        """Updates win statistics based on user feedback (reward: 1 or 0)."""
        self.shows[intent][variant] += 1
        self.wins[intent][variant] += max(0, min(1, reward))
        self._save_state()

    def _save_state(self) -> None:
        try:
            os.makedirs(os.path.dirname(self.storage_path) or ".", exist_ok=True)
            state = {
                "wins": {k: dict(v) for k, v in self.wins.items()},
                "shows": {k: dict(v) for k, v in self.shows.items()}
            }
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            logger.warning("Could not persist bandit state: %s", e)

    def _load_state(self) -> None:
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for intent, vmap in data.get("wins", {}).items():
                    for var, score in vmap.items():
                        self.wins[intent][var] = score
                for intent, vmap in data.get("shows", {}).items():
                    for var, count in vmap.items():
                        self.shows[intent][var] = count
            except Exception as e:
                logger.warning("Could not load bandit state from %s: %s", self.storage_path, e)


# Global bandit instance
bandit = ResponseBandit()
