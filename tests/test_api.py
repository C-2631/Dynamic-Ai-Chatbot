"""Integration tests for FastAPI endpoints: chat, feedback, session deletion, healthz, analytics."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["classifier_ready"] is True


def test_chat_greeting():
    payload = {
        "session_id": "test_session_001",
        "text": "Hello, good morning!",
        "channel": "web"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "greeting"
    assert len(data["reply"]) > 0
    assert data["source"] in ["bandit", "template"]


def test_chat_order_slot_filling():
    session_id = "test_slot_session_002"

    # Step 1: Ask without order id -> should request slot
    resp1 = client.post("/api/chat", json={
        "session_id": session_id,
        "text": "Where is my order?"
    })
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["source"] == "slot"
    assert "order id" in data1["reply"].lower()

    # Step 2: Provide order id -> should fill slot and give tracking
    resp2 = client.post("/api/chat", json={
        "session_id": session_id,
        "text": "My order number is ORD-887766"
    })
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "ORD-887766" in data2["reply"]
    assert data2["slots"].get("ORDER_ID") == "ORD-887766"


def test_chat_faq_matching():
    payload = {
        "session_id": "test_faq_003",
        "text": "What payment methods do you accept?"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "faq"
    assert "Visa" in data["reply"] or "PayPal" in data["reply"]


def test_feedback_and_analytics():
    session_id = "test_feedback_004"
    client.post("/api/chat", json={"session_id": session_id, "text": "Hi"})

    fb_resp = client.post("/api/feedback", json={
        "session_id": session_id,
        "rating": 1,
        "intent": "greeting",
        "variant": "Hello! How can I help you today?"
    })
    assert fb_resp.status_code == 200
    assert fb_resp.json()["status"] == "recorded"

    # Analytics summary
    summary_resp = client.get("/api/analytics/summary?days=1")
    assert summary_resp.status_code == 200
    sdata = summary_resp.json()
    assert "total_messages" in sdata
    assert sdata["total_messages"] >= 1


def test_session_deletion():
    session_id = "test_privacy_005"
    client.post("/api/chat", json={"session_id": session_id, "text": "Hi"})

    del_resp = client.delete(f"/api/session/{session_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "cleared"


def test_upload_valid_document():
    files = {"file": ("report.docx", b"Sample Word Content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["category"] == "document"
    assert data["filename"] == "report.docx"


def test_upload_rejected_extension():
    files = {"file": ("malware.exe", b"binarycontent", "application/octet-stream")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 400
    assert "Unsupported format" in resp.json()["detail"]


def test_chat_with_multimodal_attachment():
    payload = {
        "session_id": "test_multi_006",
        "text": "What is this file about?",
        "attachments": [
            {
                "filename": "quarterly_budget.pdf",
                "category": "document",
                "size_bytes": 1024,
                "extracted_text": "Quarterly Budget Summary: Total Revenue $1,200,000. Expenses $800,000. Net Profit $400,000."
            }
        ]
    }
    resp = client.post("/api/chat", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["source"] == "document"
    assert "quarterly_budget.pdf" in data["reply"]
    assert "Total Revenue" in data["reply"]


def test_get_available_models():
    resp = client.get("/api/models")
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert len(data["models"]) >= 4
    model_ids = [m["id"] for m in data["models"]]
    assert "minimax/minimax-m3.1-flash:free" in model_ids
    assert "nvidia/nemotron-3.5-super-vl:free" in model_ids
    assert "nvidia/nemotron-3.5-lightning:free" in model_ids
    assert "google/gemma-4-26b-a4b:free" in model_ids


def test_chat_with_custom_model_selection():
    payload = {
        "session_id": "test_model_007",
        "text": "Tell me about quantum computing",
        "model": "nvidia/nemotron-3.5-lightning:free",
        "provider": "openrouter"
    }
    resp = client.post("/api/chat", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data.get("model") == "nvidia/nemotron-3.5-lightning:free"

