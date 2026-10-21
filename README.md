# Dynamic AI Chatbot — Intelligent Multimodal Conversational Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

An enterprise-ready, hybrid conversational AI platform featuring a decoupled **Next.js 16** frontend and **FastAPI** backend. Built on a *"Cheapest Reliable Answer First"* philosophy, the platform delivers sub-20ms deterministic customer support answers, statistical multi-intent classification, strict multimodal file parsing, real-time VADER sentiment adaptation, and continuous reinforcement learning via contextual bandits.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                          |
|   Next.js 16 App Router  |  React 19  |  TypeScript  |  Tailwind CSS 4  |  Three.js WebGL|
+--------------------------------------------+--------------------------------------------+
                                             |
                                HTTP REST / WebSocket JSON
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                FASTAPI BACKEND GATEWAY                                  |
|   Uvicorn ASGI  |  CORS Middleware  |  Multipart Uploads  |  Static Files (/uploads)     |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                CORE INTELLIGENCE PIPELINE                               |
|   1. PII Masking (Credit Cards, SSNs, Phone, Email via Regex)                           |
|   2. Multi-Intent Classifier (TF-IDF n-grams + Logistic Regression with Priority Weights)|
|   3. Entity Extraction (Regex Matchers + spaCy NER: ORDER_ID, DATE, MONEY, GPE)         |
|   4. Sentiment Engine (VADER Polarity Scoring & 3-Strike De-escalation Trigger)         |
|   5. Strategy Chain Responder (FAQ Lookup -> Slot Verification -> LLM -> Fallback)      |
|   6. Contextual Memory (Redis Distributed Store with In-Memory Dict Fallback; 1800s TTL) |
|   7. Self-Learning Bandit (Epsilon-Greedy Multi-Armed Bandit with Laplace Smoothing)     |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               PERSISTENCE & EXTERNAL APIS                               |
|   SQLite / PostgreSQL (message_log)  |  Redis 7+  |  Groq / OpenRouter LLM Fallbacks     |
+-----------------------------------------------------------------------------------------+
```

---

## Key Capabilities

- **Hybrid Intelligence Waterfall**: Prioritizes deterministic FAQ lookups and template slot checks before calling third-party generative models, ensuring zero hallucination for corporate policies and sub-second execution.
- **Syntactic Multi-Intent Prioritization**: Automatically segments compound queries (e.g., *"Where is my package and can I get a refund?"*) on conjunctions, scoring each segment by business priority ($S = \text{confidence} \times \text{priority}$).
- **Strict Multimodal Validation**: Enforces an allowlist of 9 extensions across Documents (`.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`), Videos (`.mp4`, `.avi`), and Images (`.png`, `.jpg`, `.jpeg`). Text and structural metadata are extracted using `pypdf`, `python-docx`, and `Pillow`.
- **Contextual Session Continuity**: Maintains a rolling memory of the 10 most recent dialogue turns and extracted business slots per session, backed by Redis with automatic in-memory fallback and a 30-minute rolling TTL.
- **Sentiment-Aware Tone Adaptation**: Computes real-time polarity scores ($c \in [-1.0, +1.0]$) with VADER. Negative sentiment ($c \le -0.35$) triggers empathetic response prefixes; consecutive frustration ($n \ge 3$) triggers immediate human support escalation.
- **Contextual Bandit Self-Learning**: Learns from thumbs up/down user feedback via an $\epsilon$-greedy bandit ($\epsilon=0.15$) with Laplace smoothing, continuously promoting the most effective response variants.
- **Dual-Mode User Experience**: Features an interactive zero-barrier Demo Sandbox for exploratory guest interactions and an authenticated Live Production AI Mode.
- **Cinematic 3D Hero Interface**: Interactive WebGL sphere constructed with Three.js that responds to cursor inertia and spring damping, designed with strict WCAG 2.1 AA light-theme standards.

---

## Repository Structure

```
.
├── app/                        # FastAPI Backend Application Core
│   ├── adapters/               # Multi-channel webhooks (Telegram, Slack, WhatsApp)
│   ├── analytics/              # SQLAlchemy turn logger and KPI reporting router
│   ├── core/                   # Context manager, responder chain, bandit learner, safety
│   ├── nlp/                    # Preprocessing, intent classifier, entity slots, sentiment
│   ├── config.py               # Pydantic v2 application settings and LLM model registry
│   └── main.py                 # FastAPI application gateway and WebSocket router
├── data/                       # Ground-truth datasets & state
│   ├── faq.json                # Predefined Q&A patterns for deterministic matching
│   ├── intents.json            # Training corpus across 8 customer support classes
│   └── bandit_state.json       # Persistent reward counters for response variants
├── frontend/                   # Next.js 16 (App Router) Frontend
│   ├── public/                 # Static brand assets and SVGs
│   ├── src/                    # React 19 component hierarchy
│   │   ├── app/                # App router pages, layouts, and API proxies
│   │   ├── components/         # HeroOrb, ChatWorkspace, Gooey Attachment Menu, Markdown
│   │   └── lib/                # API client, TypeScript definitions, and hooks
│   └── package.json            # Frontend dependency specifications
├── tests/                      # Automated Test Suite
│   ├── test_api.py             # End-to-end REST and multimodal endpoint tests
│   └── test_nlp.py             # Preprocessing, classification, and sentiment unit tests
├── uploads/                    # Local storage directory for uploaded multimodal media
├── .env.example                # Template configuration parameters
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16.4+ (App Router), React 19, TypeScript, Turbopack |
| **Styling & Icons** | Tailwind CSS 4.x, Lucide React (Crisp Vector SVGs) |
| **3D & Animation** | Three.js (WebGL Particle Sphere), Framer Motion |
| **Backend Framework** | FastAPI 0.115+, Uvicorn ASGI, Pydantic v2 |
| **Natural Language Processing** | scikit-learn (TF-IDF + Logistic Regression), spaCy (`en_core_web_sm`), VADER |
| **Document & Media Parsers** | `pypdf`, `python-docx`, `Pillow (PIL)` |
| **Database & Cache** | SQLite / PostgreSQL (via SQLAlchemy ORM), Redis (with in-memory fallback) |
| **Generative AI Providers** | Groq API, OpenRouter (Llama 3.3, Mistral fallbacks) |

---

## Quick Start Guide

### Prerequisites

Ensure the following runtimes are installed on your machine:
- **Node.js**: v18.18+ or v20+
- **Python**: v3.12+
- **Git**: v2.40+
- *(Optional)* **Redis**: v7+ (an in-memory store activates automatically if Redis is unavailable)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/<your-username>/dynamic-ai-chatbot.git
cd dynamic-ai-chatbot
```

---

### Step 2: Backend Setup (FastAPI)

1. Create and activate a Python virtual environment:
   ```bash
   # Windows (Git Bash / PowerShell)
   python -m venv .venv
   source .venv/Scripts/activate

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Optional: Add your `OPENROUTER_API_KEY` or `GROQ_API_KEY` to `.env` if you want generative fallbacks).*

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend service will be live at `http://127.0.0.1:8000`.  
   Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup (Next.js)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install node dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## API Reference

The FastAPI service exposes the following core endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/healthz` | System health check and classifier readiness status |
| `GET` | `/api/models` | List configured generative LLMs and active provider status |
| `POST` | `/api/chat` | Synchronous chat endpoint executing the full NLP intelligence pipeline |
| `POST` | `/api/upload` | Multipart file upload endpoint enforcing strict 9-extension whitelist |
| `WS` | `/ws/chat/{session_id}` | Bidirectional WebSocket stream for real-time conversation |
| `POST` | `/api/feedback` | Ingests thumbs up/down ratings to update bandit weights |
| `DELETE` | `/api/session/{session_id}` | Clears conversation context and entity slots for privacy compliance |
| `GET` | `/api/analytics/summary` | Aggregated operational KPI metrics (containment, latency, CSAT) |
| `POST` | `/webhook/{platform}` | Inbound webhook adapter for Telegram, Slack, and WhatsApp |

---

## Running the Automated Test Suite

The project includes unit and integration tests covering the NLP pipeline, slot filling, upload filters, and API endpoints.

```bash
# Make sure virtual environment is active
pytest -v
```

Expected output:
```text
tests/test_api.py::test_health_check PASSED                             [  6%]
tests/test_api.py::test_chat_greeting PASSED                            [ 12%]
tests/test_api.py::test_chat_order_status_slot_prompt PASSED            [ 18%]
tests/test_api.py::test_chat_order_status_with_slot PASSED             [ 25%]
tests/test_api.py::test_faq_lookup PASSED                               [ 31%]
tests/test_api.py::test_feedback_endpoint PASSED                        [ 37%]
tests/test_api.py::test_delete_session PASSED                           [ 43%]
tests/test_api.py::test_analytics_summary PASSED                        [ 50%]
tests/test_api.py::test_upload_disallowed_extension PASSED              [ 56%]
tests/test_api.py::test_upload_allowed_document PASSED                 [ 62%]
tests/test_nlp.py::test_preprocess_clean_text PASSED                   [ 68%]
tests/test_nlp.py::test_preprocess_pii_masking PASSED                   [ 75%]
tests/test_nlp.py::test_intent_classifier_accuracy PASSED              [ 81%]
tests/test_nlp.py::test_multi_intent_segmentation PASSED               [ 87%]
tests/test_nlp.py::test_entity_extraction_order_id PASSED              [ 93%]
tests/test_nlp.py::test_sentiment_scoring PASSED                        [100%]

============================= 16 passed in 3.42s =============================
```

To verify the Next.js frontend build:
```bash
cd frontend
npm run build
```

---

## Configuration (`.env.example`)

```env
# Application Environment
ENVIRONMENT=development
PROJECT_NAME="Dynamic AI Chatbot"
DEBUG=false

# Server Network Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# Database & Cache Persistence
DATABASE_URL=sqlite:///./chatbot.db
REDIS_URL=redis://localhost:6379/0
REDIS_TTL_SECONDS=1800
MAX_TURNS=10

# Generative AI Providers (Optional Fallbacks)
OPENROUTER_API_KEY=
GROQ_API_KEY=
DEFAULT_LLM_MODEL=meta-llama/llama-3.3-70b-instruct:free
LLM_PROVIDER=openrouter

# Analytics & Webhook Security
ANALYTICS_API_KEY=
TELEGRAM_BOT_TOKEN=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=
```

---

## Author & Acknowledgements

- **Developer**: Chirag Chauhan
- **Organization**: Zidio Development
- **Mentor**: Chandan Mishra

---

## License

This project is licensed under the [MIT License](LICENSE).
