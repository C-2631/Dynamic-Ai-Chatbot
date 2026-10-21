"""Main FastAPI Application Gateway for Dynamic AI Chatbot."""

import time
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

# Strict Whitelist for Multimodal Attachments as specified in user requirements
ALLOWED_FILE_EXTENSIONS = {
    "document": {".pdf", ".docx", ".doc", ".pptx", ".ppt"},
    "video": {".mp4", ".avi"},
    "image": {".png", ".jpg", ".jpeg"}
}
ALL_ALLOWED_EXTENSIONS = {ext for exts in ALLOWED_FILE_EXTENSIONS.values() for ext in exts}

from app.config import settings, AVAILABLE_MODELS
from app.nlp.preprocess import preprocess
from app.nlp.intent import IntentClassifier
from app.nlp.entities import extract_entities
from app.nlp.sentiment import analyze_sentiment
from app.core import context
from app.core.responder import respond
from app.core.learner import bandit
from app.analytics import metrics
from app.analytics.routes import router as analytics_router
from app.adapters.telegram import parse_telegram_update, format_telegram_reply
from app.adapters.slack import parse_slack_event, format_slack_reply
from app.adapters.whatsapp import parse_whatsapp_message, format_whatsapp_reply

# Configure root logger
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("chatbot.main")

# Global Intent Classifier instance
intent_clf: Optional[IntentClassifier] = None


def get_intent_classifier() -> Optional[IntentClassifier]:
    """Retrieves or initializes the global intent classifier."""
    global intent_clf
    if intent_clf is None:
        try:
            intent_clf = IntentClassifier()
        except Exception as e:
            logger.error("Failed to load intent classifier: %s", e)
    return intent_clf


# Warm up intent classifier upon module import
get_intent_classifier()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: ensures database and NLP classifier are ready."""
    logger.info("Initializing database schema...")
    metrics.init_db()

    clf = get_intent_classifier()
    if clf:
        logger.info("Intent engine ready with %d classes.", len(clf.classes_))
    else:
        logger.warning("Intent engine could not be initialized.")

    yield

    logger.info("Shutting down application...")


# FastAPI Application instance
app = FastAPI(
    title=settings.project_name,
    version="2.0.0",
    description="Dynamic AI Chatbot API with NLP Intent Recognition, NER, Contextual Memory, and Self-Learning.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Analytics Sub-Router
app.include_router(analytics_router)


# ---------------------------------------------------------------------------
# Pydantic Request / Response Models
# ---------------------------------------------------------------------------

class ChatIn(BaseModel):
    session_id: str = Field(..., description="Unique user or session identifier")
    text: str = Field(default="", max_length=2000, description="User utterance")
    channel: Optional[str] = Field(default="web", description="Originating channel: web, mobile, telegram, etc.")
    attachments: Optional[List[Dict[str, Any]]] = Field(default=None, description="Optional attached files metadata")
    model: Optional[str] = Field(default=None, description="Selected LLM model ID")
    provider: Optional[str] = Field(default=None, description="Selected LLM provider: openrouter or groq")


class FeedbackIn(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    rating: int = Field(..., ge=0, le=1, description="1 for thumbs up, 0 for thumbs down")
    message_id: Optional[int] = Field(default=None, description="Database message ID if known")
    intent: Optional[str] = Field(default=None, description="Intent of the rated reply")
    variant: Optional[str] = Field(default=None, description="Exact text variant displayed")


# ---------------------------------------------------------------------------
# Core Message Processing Engine
# ---------------------------------------------------------------------------

async def handle_message(
    session_id: str,
    text: str,
    channel: str = "web",
    attachments: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Central pipeline orchestrator:
    1. Preprocessing & PII masking
    2. Context loading (Redis / in-memory)
    3. Multi-modal attachment parsing & reasoning (PDF, Word, PPT, MP4, AVI, PNG, JPG)
    4. Multi-intent analysis & prioritization
    5. Named entity recognition & slot extraction
    6. Sentiment scoring & tone detection
    7. Strategy chain response generation (FAQ -> template/slot -> LLM -> fallback)
    8. Context update and rolling memory save
    9. Relational analytics logging
    """
    start_time = time.perf_counter()

    # Handle Multi-Modal Attachment Queries
    if attachments and len(attachments) > 0:
        first_att = attachments[0]
        cat = first_att.get("category", "document")
        fname = first_att.get("filename", "file")
        extracted = first_att.get("extracted_text", "").strip()

        if cat == "document":
            if extracted:
                snippet = "\n".join([line.strip() for line in extracted.split("\n") if line.strip()][:8])
                custom_reply = (
                    f"I have thoroughly reviewed and parsed your document '{fname}'.\n\n"
                    f"Summary of document content:\n{snippet}\n\n"
                    f"What specific questions or sections from '{fname}' would you like me to analyze further?"
                )
            else:
                custom_reply = (
                    f"I have received your document '{fname}'. The presentation/document structure has been cataloged. "
                    f"How can I assist you with this document?"
                )
            out = {"reply": custom_reply, "source": "document"}
            intent = "document_analysis"
            conf = 1.0
            ents = {}
            sent = {"label": "neutral", "score": 0.0}
            sec_intent = None
        elif cat == "image":
            details = first_att.get("details", {})
            dim_str = f"{details.get('size', [0, 0])[0]}x{details.get('size', [0, 0])[1]}" if details.get("size") else "standard"
            fmt = details.get("format", "PNG/JPG")
            custom_reply = (
                f"I have received and inspected your image '{fname}' (Format: {fmt}, Dimensions: {dim_str}). "
                f"How can I assist you regarding this image?"
            )
            out = {"reply": custom_reply, "source": "image"}
            intent = "image_analysis"
            conf = 1.0
            ents = {}
            sent = {"label": "neutral", "score": 0.0}
            sec_intent = None
        elif cat == "video":
            custom_reply = (
                f"I have received and validated your video '{fname}'. The video metadata has been registered in our pipeline. "
                f"You can ask me to outline key discussion points, timestamps, or transcribe sections."
            )
            out = {"reply": custom_reply, "source": "video"}
            intent = "video_analysis"
            conf = 1.0
            ents = {}
            sent = {"label": "neutral", "score": 0.0}
            sec_intent = None
        else:
            out = {"reply": f"Attachment '{fname}' has been processed.", "source": "attachment"}
            intent = "attachment"
            conf = 1.0
            ents = {}
            sent = {"label": "neutral", "score": 0.0}
            sec_intent = None

        # Load context
        ctx = context.load(session_id)
        ctx["turns"].append({
            "u": text or f"[Uploaded {fname}]",
            "b": out["reply"],
            "ts": time.time()
        })
        ctx["last_intent"] = intent
        context.save(session_id, ctx)

        latency_ms = int((time.perf_counter() - start_time) * 1000)
        turn_id = metrics.log_turn(
            session_id=session_id,
            channel=channel,
            intent=intent,
            confidence=conf,
            sentiment=sent["label"],
            source=out["source"],
            latency_ms=latency_ms
        )

        return {
            "reply": out["reply"],
            "source": out["source"],
            "intent": intent,
            "confidence": conf,
            "sentiment": sent,
            "entities": ents,
            "slots": ctx.get("slots", {}),
            "turn_id": turn_id,
            "session_id": session_id,
            "latency_ms": latency_ms
        }
    start_time = time.perf_counter()

    # Step 1: Preprocess text
    prep = preprocess(text)
    clean_text = prep["clean_text"]

    # Step 2: Load Context
    ctx = context.load(session_id)

    # Step 3: Resolve Follow-up & Intent Classification
    followup_intent = context.resolve_followup(clean_text, ctx)

    clf = get_intent_classifier()
    if clf is not None:
        multi_intents = clf.analyze_multi_intent(clean_text)
        top = multi_intents[0]
        intent = followup_intent or top["intent"]
        conf = top["confidence"]
        # Identify secondary intent if multi-intent query detected
        sec_intent = None
        if len(multi_intents) > 1 and multi_intents[1]["confidence"] >= 0.35:
            if multi_intents[1]["intent"] != intent:
                sec_intent = multi_intents[1]["intent"]
    else:
        intent = "greeting"
        conf = 1.0
        sec_intent = None

    # Step 4: Named Entity Recognition
    ents = extract_entities(clean_text)

    # Step 5: Sentiment & Emotion Analysis
    sent = analyze_sentiment(clean_text)

    # Step 6: Response Engine Strategy Chain
    # Step 6: Response Engine Strategy Chain
    out = await respond(
        text=clean_text,
        intent=intent,
        conf=conf,
        ents=ents,
        ctx=ctx,
        sentiment=sent,
        secondary_intent=sec_intent,
        attachments=attachments,
        model=model,
        provider=provider
    )

    # Step 7: Update and Persist Session Context
    ctx["turns"].append({
        "u": clean_text,
        "b": out["reply"],
        "ts": time.time()
    })
    ctx.setdefault("slots", {}).update(ents)
    ctx["last_intent"] = intent
    context.save(session_id, ctx)

    # Step 8: Calculate latency & log analytics turn
    latency_ms = int((time.perf_counter() - start_time) * 1000)
    turn_id = metrics.log_turn(
        session_id=session_id,
        channel=channel,
        intent=intent,
        confidence=conf,
        sentiment=sent["label"],
        source=out["source"],
        latency_ms=latency_ms
    )

    return {
        "reply": out["reply"],
        "source": out["source"],
        "intent": intent,
        "confidence": round(conf, 3),
        "sentiment": sent,
        "entities": ents,
        "slots": ctx["slots"],
        "turn_id": turn_id,
        "session_id": session_id,
        "latency_ms": latency_ms,
        "model": out.get("model", model or settings.default_llm_model),
        "provider": out.get("provider", provider or settings.llm_provider)
    }


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/healthz", tags=["system"])
def health_check():
    """Service health check endpoint."""
    clf = get_intent_classifier()
    return {
        "status": "healthy",
        "app": settings.project_name,
        "environment": settings.environment,
        "classifier_ready": clf is not None
    }


@app.get("/api/models", tags=["llm"])
def get_available_models():
    """
    Returns list of supported LLM models across OpenRouter and Groq.
    """
    has_groq = bool(settings.groq_api_key or os.getenv("GROQ_API_KEY"))
    has_or = bool(settings.openrouter_api_key or os.getenv("OPENROUTER_API_KEY"))
    return {
        "default_model": settings.default_llm_model,
        "default_provider": settings.llm_provider,
        "groq_configured": has_groq,
        "openrouter_configured": has_or,
        "models": AVAILABLE_MODELS
    }


@app.post("/api/chat", tags=["chat"])
async def chat_endpoint(body: ChatIn):
    """
    REST chat endpoint.
    Processes user query and returns bot response with metadata.
    """
    try:
        return await handle_message(
            session_id=body.session_id,
            text=body.text,
            channel=body.channel or "web",
            attachments=body.attachments,
            model=body.model,
            provider=body.provider
        )
    except Exception as e:
        logger.exception("Error in /api/chat: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong on our side. Please try again."
        )


@app.post("/api/upload", tags=["multimodal"])
async def upload_file_endpoint(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form("default")
):
    """
    Multi-modal file upload endpoint with strict format enforcement.
    Strictly accepts:
    - Documents: .pdf, .docx, .doc, .pptx, .ppt
    - Videos: .mp4, .avi
    - Images: .png, .jpg, .jpeg
    Extracts text/metadata and registers file in uploads.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    category = None
    for cat, exts in ALLOWED_FILE_EXTENSIONS.items():
        if ext in exts:
            category = cat
            break

    if not category:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Only Documents (PDF, DOC, DOCX, PPT, PPTX), Videos (MP4, AVI), and Images (PNG, JPG) are supported."
        )

    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    safe_filename = f"{int(time.time())}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(uploads_dir, safe_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    extracted_text = ""
    details = {}

    if ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            extracted_text = "\n".join([p.extract_text() or "" for p in reader.pages[:10]])
            details = {"pages": len(reader.pages)}
        except Exception as e:
            logger.warning("PDF extraction failed: %s", e)
    elif ext in [".docx", ".doc"]:
        try:
            import docx
            doc = docx.Document(file_path)
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
            details = {"paragraphs": len(doc.paragraphs)}
        except Exception as e:
            logger.warning("DOCX extraction failed: %s", e)
    elif ext in [".png", ".jpg", ".jpeg"]:
        try:
            from PIL import Image
            with Image.open(file_path) as img:
                details = {"format": img.format, "size": list(img.size), "mode": img.mode}
        except Exception as e:
            logger.warning("Image inspect notice: %s", e)
    elif ext in [".mp4", ".avi"]:
        details = {"size_bytes": len(content), "format": ext.replace(".", "").upper()}

    return {
        "status": "success",
        "filename": file.filename,
        "file_url": f"http://localhost:8000/uploads/{safe_filename}",
        "category": category,
        "size_bytes": len(content),
        "details": details,
        "extracted_text": extracted_text[:3000]
    }


# Mount uploads directory for static media serving
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.websocket("/ws/chat/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    """
    Bi-directional streaming WebSocket endpoint for real-time conversation.
    """
    await websocket.accept()
    logger.info("WebSocket connected for session: %s", session_id)
    try:
        while True:
            raw_text = await websocket.receive_text()
            if not raw_text.strip():
                continue

            response = await handle_message(session_id=session_id, text=raw_text, channel="websocket")
            await websocket.send_json(response)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for session: %s", session_id)
    except Exception as e:
        logger.exception("WebSocket error for session %s: %s", session_id, e)
        try:
            await websocket.send_json({
                "reply": "An unexpected error occurred. Please try again.",
                "source": "error"
            })
        except Exception:
            pass


@app.post("/api/feedback", tags=["learning"])
def feedback_endpoint(body: FeedbackIn):
    """
    Records thumbs up/down user feedback.
    Updates bandit weights and relational analytics log.
    """
    db_updated = metrics.update_feedback(
        session_id=body.session_id,
        rating=body.rating,
        message_id=body.message_id
    )

    if body.intent and body.variant:
        bandit.update(body.intent, body.variant, body.rating)

    return {
        "status": "recorded",
        "db_updated": db_updated,
        "session_id": body.session_id
    }


@app.delete("/api/session/{session_id}", tags=["privacy"])
def delete_session_endpoint(session_id: str):
    """
    Deletes user chat session and memory for privacy compliance.
    """
    cleared = context.clear(session_id)
    return {
        "status": "cleared" if cleared else "not_found",
        "session_id": session_id
    }


@app.post("/webhook/{platform}", tags=["webhooks"])
async def platform_webhook(platform: str, request: Request):
    """
    Multi-platform inbound webhook adapter for Telegram, Slack, and WhatsApp.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    platform = platform.lower()

    # 1. Telegram
    if platform == "telegram":
        parsed = parse_telegram_update(payload)
        if not parsed:
            return {"ok": True}
        session_id, text, chat_id = parsed
        result = await handle_message(session_id, text, channel="telegram")
        return format_telegram_reply(chat_id, result["reply"])

    # 2. Slack
    elif platform == "slack":
        # Handle Slack URL verification challenge
        if payload.get("type") == "url_verification":
            return {"challenge": payload.get("challenge")}

        parsed = parse_slack_event(payload)
        if not parsed:
            return {"ok": True}
        session_id, text, channel = parsed
        result = await handle_message(session_id, text, channel="slack")
        return format_slack_reply(channel, result["reply"])

    # 3. WhatsApp
    elif platform == "whatsapp":
        parsed = parse_whatsapp_message(payload)
        if not parsed:
            return {"status": "ignored"}
        session_id, text, sender = parsed
        result = await handle_message(session_id, text, channel="whatsapp")
        return format_whatsapp_reply(sender, result["reply"])

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")


# ---------------------------------------------------------------------------
# Custom 404 Exception Handler (Section 12.6 of Specification)
# ---------------------------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Returns custom 404 HTML page if requested by browser, or JSON for API clients.
    """
    accept_header = request.headers.get("accept", "")
    if exc.status_code == 404 and "text/html" in accept_header:
        html_404_path = os.path.join(os.path.dirname(__file__), "..", "web", "404.html")
        if os.path.exists(html_404_path):
            return FileResponse(html_404_path, status_code=404)

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )
