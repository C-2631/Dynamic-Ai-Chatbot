"""Response engine executing the strategy chain: FAQ -> Rules/Templates -> LLM -> Fallbacks."""

import json
import os
import re
import logging
from typing import Dict, Any, Optional, List
from app.config import settings
from app.core.learner import bandit, DEFAULT_VARIANTS
from app.core.safety import is_safe_response, apply_ethical_nudges

logger = logging.getLogger("chatbot.responder")

CONF_HIGH = 0.65
CONF_LOW = 0.35

# Required slots per intent
REQUIRED_SLOTS = {
    "order_status": ["ORDER_ID"],
    "refund": ["ORDER_ID"],
    "cancel_order": ["ORDER_ID"],
}

# Standard template responses
TEMPLATES = {
    "order_status": "Your order {ORDER_ID} is currently in transit with FedEx and is scheduled for delivery within 2 business days. Tracking updates will be emailed to you.",
    "refund": "I have initiated the return and refund request for order {ORDER_ID}. Once the item is scanned at the carrier, your refund of the full order amount will be credited within 3-5 business days.",
    "cancel_order": "Order {ORDER_ID} has been successfully canceled before dispatch. Any temporary payment authorization will clear within 24 hours.",
    "business_hours": "Our customer support team is available Monday through Friday from 8:00 AM to 8:00 PM EST, and Saturday from 9:00 AM to 5:00 PM EST. Our automated assistant is here 24/7.",
    "human_handoff": "I am connecting you with a live customer support representative right now. An agent will join this conversation shortly.",
    "account_help": "To secure or update your account, you can reset your password anytime from the Login screen via 'Forgot Password', or navigate to Account Settings > Security.",
    "shipping_info": "We offer Standard Shipping (3-5 business days) for $4.99 (Free on orders over $50), and Express Shipping (1-2 business days) for $12.99 across all domestic addresses.",
}

# Cache for loaded FAQ items
_FAQ_ITEMS: Optional[List[Dict[str, Any]]] = None


def load_faq() -> List[Dict[str, Any]]:
    """Loads and caches FAQ Q&A dataset."""
    global _FAQ_ITEMS
    if _FAQ_ITEMS is not None:
        return _FAQ_ITEMS

    faq_path = "data/faq.json"
    if not os.path.exists(faq_path):
        alt = os.path.join(os.path.dirname(__file__), "..", "..", faq_path)
        if os.path.exists(alt):
            faq_path = alt

    if os.path.exists(faq_path):
        try:
            with open(faq_path, "r", encoding="utf-8") as f:
                _FAQ_ITEMS = json.load(f)
                return _FAQ_ITEMS
        except Exception as e:
            logger.error("Failed to load FAQ items: %s", e)

    _FAQ_ITEMS = []
    return _FAQ_ITEMS


def faq_lookup(text: str) -> Optional[str]:
    """Matches text against predefined FAQ patterns using exact & token overlap."""
    faqs = load_faq()
    query_tokens = set(re.findall(r"\w+", text.lower()))
    if not query_tokens:
        return None

    best_match = None
    best_score = 0.0

    for item in faqs:
        for pattern in item.get("patterns", []):
            pat_tokens = set(re.findall(r"\w+", pattern.lower()))
            if not pat_tokens:
                continue

            # Check direct substring
            if pattern.lower() in text.lower() or text.lower() in pattern.lower():
                return item["answer"]

            # Jaccard similarity
            intersection = query_tokens.intersection(pat_tokens)
            union = query_tokens.union(pat_tokens)
            score = len(intersection) / len(union) if union else 0.0

            if score > best_score:
                best_score = score
                best_match = item["answer"]

    # Threshold for fuzzy FAQ match
    if best_score >= 0.55 and best_match:
        return best_match

    return None


from app.core.llm_client import generate_llm_response


async def call_llm(
    text: str,
    ctx: Dict[str, Any],
    intent: str,
    attachments: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Handles generative queries via Groq or OpenRouter.
    Incorporates conversational memory and multimodal attachments.
    """
    context_turns = ctx.get("turns", [])
    return await generate_llm_response(
        prompt=text,
        context_turns=context_turns,
        attachments=attachments,
        model=model,
        provider=provider
    )


def finish(
    reply: str,
    sentiment: Dict[str, Any],
    source: str,
    secondary_intent: Optional[str] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """Applies tone adjustment and ethical UX polishing to final reply."""
    text = reply

    # Negative sentiment tone adjustment
    if sentiment.get("label") == "negative" and not text.startswith("I notice this has been"):
        text = f"I'm sorry for any trouble. {text}"

    # Secondary intent bridging (multi-intent support)
    if secondary_intent:
        clean_sec = secondary_intent.replace("_", " ")
        text += f"\n\nI can also assist with your {clean_sec}. Would you like to proceed with that?"

    # Safety and dark pattern filtering
    safe, text = is_safe_response(text)
    text = apply_ethical_nudges(text)

    result: Dict[str, Any] = {
        "reply": text,
        "source": source,
    }
    if model:
        result["model"] = model
    if provider:
        result["provider"] = provider

    return result


async def respond(
    text: str,
    intent: str,
    conf: float,
    ents: Dict[str, Any],
    ctx: Dict[str, Any],
    sentiment: Dict[str, Any],
    secondary_intent: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the 5-step Strategy Chain specified in Section 8.1:
    1. FAQ exact/fuzzy lookup
    2. Confident intent (>= 0.75) -> template / slot verification
    3. LLM generative synthesis (Groq / OpenRouter) for medium confidence or general queries
    4. Low confidence (< 0.40) -> clarify or escalate to human
    5. Emotional escalation: 3+ negative turns -> human handoff
    """
    # Check repeated negative sentiment escalation (Section 9.1)
    if sentiment.get("label") == "negative":
        ctx["negative_turns"] = ctx.get("negative_turns", 0) + 1
    else:
        ctx["negative_turns"] = 0

    if ctx["negative_turns"] >= 3 or sentiment.get("is_urgent"):
        return finish(
            "I notice this has been frustrating, and I want to ensure you receive the best care. I am connecting you with a human support specialist right now.",
            sentiment,
            source="handoff"
        )

    # 1. FAQ exact / near match
    faq_answer = faq_lookup(text)
    if faq_answer:
        ctx["fallbacks"] = 0
        return finish(faq_answer, sentiment, source="faq", secondary_intent=secondary_intent)

    # 2. Confident intent -> template / rules / slot verification
    if conf >= CONF_HIGH:
        ctx["fallbacks"] = 0

        # Handle bandit-optimized greetings
        if intent == "greeting":
            variant = bandit.choose("greeting", DEFAULT_VARIANTS.get("greeting", ["Hello! How can I help you?"]))
            bandit.record_show("greeting", variant)
            return finish(variant, sentiment, source="bandit", secondary_intent=secondary_intent)

        if intent in TEMPLATES:
            # Check slot requirements
            available_slots = {**ctx.get("slots", {}), **ents}
            required = REQUIRED_SLOTS.get(intent, [])
            missing = [s for s in required if s not in available_slots]

            if missing:
                missing_slot_name = missing[0].replace("_", " ").lower()
                return finish(
                    f"Could you please share your {missing_slot_name} (e.g. ORD-123456) so I can assist you?",
                    sentiment,
                    source="slot"
                )

            # Slot filled -> format template
            template_text = TEMPLATES[intent].format(**available_slots)
            return finish(template_text, sentiment, source="template", secondary_intent=secondary_intent)

    # 3. LLM Generative synthesis via Groq / OpenRouter
    has_api_keys = bool(settings.openrouter_api_key or settings.groq_api_key or os.getenv("OPENROUTER_API_KEY") or os.getenv("GROQ_API_KEY"))
    if conf >= CONF_LOW or has_api_keys or attachments:
        ctx["fallbacks"] = 0
        llm_out = await call_llm(
            text=text,
            ctx=ctx,
            intent=intent,
            attachments=attachments,
            model=model,
            provider=provider
        )
        return finish(
            llm_out["reply"],
            sentiment,
            source="llm",
            secondary_intent=secondary_intent,
            model=llm_out.get("model"),
            provider=llm_out.get("provider")
        )

    # 4. Low confidence -> clarify, then escalate
    ctx["fallbacks"] = ctx.get("fallbacks", 0) + 1
    if ctx["fallbacks"] >= 2:
        return finish(
            "I'm not getting this right, and I don't want to keep you waiting. Would you like me to connect you to a live support person?",
            sentiment,
            source="handoff"
        )

    return finish(
        "I didn't quite catch that. Are you asking about tracking an order, requesting a refund, shipping rates, or account help?",
        sentiment,
        source="clarify"
    )

