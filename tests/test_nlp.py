"""Unit tests for NLP pipeline components: preprocessing, intent, entities, sentiment."""

import pytest
from app.nlp.preprocess import preprocess, mask_pii
from app.nlp.intent import IntentClassifier
from app.nlp.entities import extract_entities
from app.nlp.sentiment import analyze_sentiment


def test_pii_masking():
    sample = "My card number is 4111 2222 3333 4444 and my SSN is 123-45-6789."
    masked, pii_data = mask_pii(sample)
    assert "[MASKED_CARD]" in masked
    assert "[MASKED_SSN]" in masked
    assert "4111" not in masked
    assert "123-45" not in masked


def test_intent_classification():
    clf = IntentClassifier()
    # Test Greeting
    pred_greet = clf.predict("Hello there good morning")
    assert pred_greet[0][0] == "greeting"
    assert pred_greet[0][1] > 0.40

    # Test Order Status
    pred_order = clf.predict("Where is my package and order status?")
    assert pred_order[0][0] == "order_status"

    # Test Refund
    pred_refund = clf.predict("I want a full refund and money back please")
    assert pred_refund[0][0] == "refund"


def test_multi_intent_segmentation():
    clf = IntentClassifier()
    compound = "Where is my order, and can I get a refund?"
    results = clf.analyze_multi_intent(compound)
    assert len(results) >= 2
    intents = [r["intent"] for r in results]
    assert "order_status" in intents
    assert "refund" in intents


def test_entity_extraction():
    # Order ID regex
    text1 = "Can you track my package for order ORD-987654?"
    ents1 = extract_entities(text1)
    assert ents1.get("ORDER_ID") == "ORD-987654"

    # Email
    text2 = "Send the receipt to user@example.com please"
    ents2 = extract_entities(text2)
    assert ents2.get("EMAIL") == "user@example.com"


def test_sentiment_analysis():
    # Positive
    pos = analyze_sentiment("Thank you so much, this service is wonderful and great!")
    assert pos["label"] == "positive"
    assert pos["score"] >= 0.35

    # Negative
    neg = analyze_sentiment("This is terrible, completely broken and unacceptable delay!")
    assert neg["label"] == "negative"
    assert neg["score"] <= -0.35
