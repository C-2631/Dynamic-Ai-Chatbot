# Technical Specification: Frameworks, Skills, Libraries, and AI/ML Models

This document provides a comprehensive technical inventory of all **Artificial Intelligence (AI)**, **Machine Learning (ML)**, **Natural Language Processing (NLP)**, and **Software Engineering Frameworks, Libraries, and Skills** implemented in the **Dynamic AI Chatbot** platform.

---

## 1. AI & Machine Learning Models

The platform adopts a **hybrid waterfall architecture** ("Cheapest Reliable Answer First"), combining deterministic models, statistical machine learning, affective computing, reinforcement learning, and state-of-the-art foundation LLMs.

```
+---------------------------------------------------------------------------------------------------+
|                                     INCOMING USER UTTERANCE                                       |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 1. Text Preprocessing & PII Masking (Regex Engine)         |
                     +-----------------------------+-----------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 2. Multi-Intent Classifier (TF-IDF + Logistic Regression)  |
                     +-----------------------------+-----------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 3. Named Entity Recognition (spaCy NER + Pattern Regex)   |
                     +-----------------------------+-----------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 4. Sentiment & Urgency Analysis (VADER Polarity Engine)   |
                     +-----------------------------+-----------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 5. Contextual Memory & Slot Verification (Redis / Memory) |
                     +-----------------------------+-----------------------------+
                                                   |
                       +---------------------------+---------------------------+
                       |                                                       |
        [Deterministic Match / Slot Met]                            [Generative Fallback Needed]
                       |                                                       |
                       v                                                       v
+---------------------------------------------+         +---------------------------------------------+
| 6a. FAQ Lookup & Bandit Response Selector   |         | 6b. Cloud LLM Inference Engine              |
| (Cosine Similarity + Contextual Epsilon-    |         | (Groq Llama 3.3 70B / OpenRouter Free Tier: |
| Greedy Bandit with Laplace Smoothing)       |         | MiniMax M3.1 Flash, Nemotron, Gemma 4)      |
+---------------------------------------------+         +---------------------------------------------+
                       |                                                       |
                       +---------------------------+---------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 7. Sentiment Adaptation & Dynamic Tone Prefixing           |
                     +-----------------------------+-----------------------------+
                                                   |
                                                   v
                     +-----------------------------------------------------------+
                     | 8. Telemetry, Turn Logging & Self-Learning Feedback Loop  |
                     +-----------------------------------------------------------+
```

---

### 1.1 Intent Classification Model (Statistical ML)

- **Algorithm**: TF-IDF Feature Vectorizer paired with Multinomial Logistic Regression.
- **Implementation**: `scikit-learn` (`TfidfVectorizer`, `LogisticRegression`).
- **Feature Extraction**:
  - $n$-gram range: Unigrams and Bigrams `(1, 2)`.
  - Sublinear term-frequency scaling (`sublinear_tf=True`) to dampen repetitive terms.
  - Case-insensitive tokenization and punctuation stripping.
- **Model Parameters**:
  - Regularization parameter: $C = 10.0$ (L2 Ridge regularization).
  - Maximum iterations: $1000$.
  - Random seed: $42$.
- **Intent Classes (8 Domains)**:
  1. `greeting` (Priority 1)
  2. `business_hours` (Priority 2)
  3. `shipping_info` (Priority 2)
  4. `order_status` (Priority 3)
  5. `account_help` (Priority 3)
  6. `cancel_order` (Priority 4)
  7. `refund` (Priority 4)
  8. `human_handoff` (Priority 5)
- **Multi-Intent Syntactic Segmentation**:
  - Compound user queries (e.g., *"Where is my package and can I get a refund?"*) are parsed via regex boundary splitting on conjunctions (`and`, `and also`, `but`, `plus`, `;`, `?`).
  - Each individual segment is independently classified and ranked by a composite priority-weighted score:
    $$\text{Score} = \text{Confidence} \times \text{PriorityWeight}$$

---

### 1.2 Named Entity Recognition (NER) & Slot Extraction

- **Hybrid Pipeline**: Statistical transformer/transition-based NER layered with high-precision regular expression matchers.
- **Statistical Model**: spaCy Small English Pipeline (`en_core_web_sm`).
  - Extracted Standard Entities: `DATE`, `TIME`, `MONEY`, `GPE` (Geopolitical Entities), `PERSON`, `ORG`.
- **Domain-Specific Pattern Extractors**:
  - `ORDER_ID`: Regex pattern `\b(?:ORD|order)[-#\s]?(\d{5,10})\b` and contextual fallback `\b#?(\d{6,10})\b` (automatically standardizes to canonical `ORD-XXXXXX` format).
  - `EMAIL`: RFC 5322 compliant regex pattern `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b`.
  - `PHONE`: E.164 and North American format regex pattern `\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b`.
- **Slot Filling Engine**: Tracks required slots (e.g., `order_status` requires `ORDER_ID`). If missing, dynamically prompts the user for clarification while preserving dialogue state.

---

### 1.3 Sentiment & Affective Computing Model

- **Engine**: VADER (Valence Aware Dictionary and sEntiment Reasoner).
- **Implementation**: `vaderSentiment.vaderSentiment.SentimentIntensityAnalyzer`.
- **Metric**: Normalized compound valence score $c \in [-1.0, +1.0]$.
- **Decision Thresholds**:
  - **Positive**: $c \ge +0.35$
  - **Neutral**: $-0.35 < c < +0.35$
  - **Negative**: $c \le -0.35$
- **Urgency & Escalation Logic**:
  - Urgency Trigger: Set when $c \le -0.60$ or when critical dissatisfaction keywords occur (*"furious"*, *"unacceptable"*, *"fraud"*, *"lawsuit"*, *"scam"*).
  - Dynamic Tone Adaptation: Prepends empathetic acknowledgment prefixes to responses when $c \le -0.35$.
  - 3-Strike De-escalation Rule: Three consecutive negative turns automatically trigger an escalation handoff to human support.

---

### 1.4 Reinforcement Learning: Contextual Multi-Armed Bandit

- **Algorithm**: $\epsilon$-Greedy Multi-Armed Bandit with Laplace Smoothing.
- **File Implementation**: [app/core/learner.py](file:///d:/AI%20Projects/Dynamic%20AI%20Chatbot%20-%20Zidio/app/core/learner.py).
- **Parameters**:
  - Exploration rate ($\epsilon$): $0.15$ (15% random variant exploration).
  - Exploitation rate ($1 - \epsilon$): $0.85$ (85% optimal variant selection).
  - Smoothing: Laplace add-one smoothing to prevent zero-frequency division:
    $$\text{Score}(v) = \frac{\text{Wins}(v) + 1.0}{\text{Shows}(v) + 2.0}$$
- **Reward Signal**: Binary user feedback ($+1$ for thumbs-up, $0$ for thumbs-down).
- **State Persistence**: Serialized atomic JSON file at `data/bandit_state.json`.

---

### 1.5 Foundation Large Language Models (Generative AI)

When deterministic FAQ and rule templates do not satisfy the query confidence threshold ($\text{confidence} < 0.65$), the system routes to high-performance LLMs via asynchronous REST gateways:

| Model Identifier | Provider | Architecture / Origin | Key Characteristics & Use Case |
|---|---|---|---|
| **`llama-3.3-70b-versatile`** | Groq API | Meta Llama 3.3 (70B) | High-reasoning enterprise tasks running on Groq LPUs at ~300 tokens/sec. |
| **`llama-3.1-8b-instant`** | Groq API | Meta Llama 3.1 (8B) | Ultra-low latency responses with sub-100ms time-to-first-token. |
| **`minimax/minimax-m3.1-flash:free`** | OpenRouter | MiniMax M3.1 Flash | 1M token context window, agentic workflows, complex multimodal synthesis. |
| **`nvidia/nemotron-3.5-super-vl:free`** | OpenRouter | NVIDIA Nemotron 3.5 | Vision-language reasoning, structural document analysis, complex logic. |
| **`nvidia/nemotron-3.5-lightning:free`** | OpenRouter | NVIDIA Nemotron MoE | Ultra-fast Mixture-of-Experts architecture for instant query completion. |
| **`google/gemma-4-26b-a4b:free`** | OpenRouter | Google Gemma (26B) | Open weights analytical intelligence, code breakdown, structured extraction. |

---

### 1.6 Multimodal Perception & Document Parsing Models

- **PDF Documents**: `pypdf` (`PdfReader`) — Extracts structured text, extracts page count metadata, and performs multi-page indexing up to 10 pages per document.
- **Word Documents**: `python-docx` (`Document`) — Parses paragraphs, runs, inline text, and document structure (`.docx`, `.doc`).
- **Computer Vision / Image Inspection**: `Pillow` (`PIL.Image`) — Inspects image headers, verifies image dimensions, color channels, and validates format (`.png`, `.jpg`, `.jpeg`).
- **Video Inspection**: Structural binary validation verifying container format, byte lengths, and MIME encodings for `.mp4` and `.avi`.

---

## 2. Core AI & Engineering Skills Implemented

The architecture demonstrates mastery across several critical AI/ML and software engineering disciplines:

1. **Natural Language Processing (NLP) & Feature Engineering**:
   - Tokenization, lowercasing, punctuation stripping, sublinear term frequency weighting, and bigram feature generation.
   - PII (Personally Identifiable Information) Redaction: Automated masking of credit card numbers, Social Security Numbers, emails, and telephone numbers prior to any model inference.

2. **Affective Computing & Dynamic Tone Adaptation**:
   - Sentiment polarity tracking, emotional trajectory modeling across turns, and real-time response prefixing.

3. **Dialogue State Tracking (DST) & Slot Filling**:
   - Extraction and tracking of business parameters (`ORDER_ID`, `EMAIL`, etc.) across multi-turn sessions with validation checks.

4. **Reinforcement Learning from Human Feedback (RLHF) via Bandits**:
   - Online learning from implicit and explicit user interaction (thumbs up/down) to optimize conversational copy without retraining core models.

5. **Multimodal Media Ingestion**:
   - Strict 9-extension whitelist validation, in-memory stream processing, and multimodal text extraction from documents, images, and video metadata.

6. **Hybrid Conversational Routing (Waterfall Strategy)**:
   - "Cheapest Reliable Answer First": FAQ Cosine Match $\rightarrow$ Rule & Slot Templates $\rightarrow$ High-Speed Generative LLM $\rightarrow$ Graceful Fallback / Human Support Escalation.

7. **Observability, Telemetry & Analytical Logging**:
   - Millisecond-level latency tracking, containment rate calculation, intent distribution metrics, and relational turn logging.

8. **Full-Stack Decoupled Architecture**:
   - Asynchronous Python backend paired with modern React 19 / Next.js 16 frontend communicating via type-safe REST and WebSocket endpoints.

---

## 3. Software Frameworks & Libraries

### 3.1 Backend Ecosystem (Python 3.12+)

| Library / Framework | Version | Primary Purpose |
|---|---|---|
| **FastAPI** | `>=0.110.0` | High-performance asynchronous REST API gateway, dependency injection, and WebSocket routing. |
| **Uvicorn (Standard)** | `>=0.28.0` | Production ASGI web server with `uvloop` and `httptools` bindings. |
| **Pydantic** | `>=2.7.0` | Strict data validation, schema enforcement, and type coercion. |
| **Pydantic Settings** | `>=2.2.0` | Environment variable management and `.env` parsing. |
| **scikit-learn** | `>=1.4.0` | Statistical ML: TF-IDF feature extraction, Logistic Regression, probability calibration. |
| **spaCy** | `>=3.7.0` | Named Entity Recognition (NER), linguistic parsing, and `en_core_web_sm` pipeline. |
| **vaderSentiment** | `>=3.3.2` | Rule-based sentiment analysis and compound polarity scoring. |
| **SQLAlchemy** | `>=2.0.0` | Modern Python ORM for relational persistence (`message_log` analytics and turns). |
| **psycopg2-binary** | `>=2.9.0` | PostgreSQL database driver for production enterprise deployments. |
| **redis** | `>=5.0.0` | Distributed key-value cache for session memory and TTL management (with in-memory fallback). |
| **httpx** | `>=0.27.0` | Asynchronous HTTP client for communicating with Groq and OpenRouter LLM APIs. |
| **python-multipart** | `>=0.0.9` | Multipart form-data streaming parser for file uploads (`/api/upload`). |
| **pypdf** | `>=4.0.0` | PDF document parser and text extractor. |
| **python-docx** | `>=1.1.0` | Microsoft Word document parser and paragraph extractor. |
| **Pillow (PIL)** | `>=10.0.0` | Image processing, metadata extraction, and dimension inspection. |
| **python-dotenv** | `>=1.0.0` | Environment variable loading from `.env` files. |
| **pytest** | `>=8.0.0` | Automated test suite for unit, integration, and API validation. |

---

### 3.2 Frontend Ecosystem (Next.js 16 & React 19)

| Library / Framework | Version | Primary Purpose |
|---|---|---|
| **Next.js** | `16.4.2` | App Router architecture, Turbopack bundler, React Server Components (RSC), and Partial Prerendering. |
| **React** | `19.3.0` | Next-generation declarative UI library with concurrent rendering and modern hooks. |
| **React-DOM** | `19.3.0` | DOM rendering layer for React 19. |
| **TypeScript** | `^5.0.0` | Static type safety, strict interface declarations, and compilation checks. |
| **Tailwind CSS** | `^4.0.0` | Modern utility-first CSS styling engine. |
| **@tailwindcss/turbopack**| `^4.0.0` | High-speed Tailwind compilation pipeline optimized for Turbopack. |
| **Three.js** | `^0.186.1` | WebGL 3D graphics library powering the interactive Neural Core particle sphere with spring physics. |
| **@types/three** | `^0.186.0` | TypeScript definitions for Three.js. |
| **Framer Motion** | `^14.4.0` | Fluid spring physics animations, layout transitions, and interactive attachment gooey menus. |
| **Lucide React** | `^1.59.0` | Crisp vector iconography for all UI controls and status badges. |
| **clsx** | `^2.1.1` | Conditional utility for constructing dynamic `className` strings. |
| **tailwind-merge** | `^3.7.0` | Merges Tailwind CSS classes cleanly without style specificity conflicts. |

---

## 4. Architectural Summary Matrix

| Layer | Component | Technology / Library | Execution Mode |
|---|---|---|---|
| **Client UI** | Web Interface | Next.js 16 + React 19 + TypeScript | Browser / SSR (Vercel) |
| **Visual Effects** | 3D Interactive Hero | Three.js (WebGL Particle Mesh) | Client GPU Render |
| **Styling** | UI Design System | Tailwind CSS 4 + Framer Motion | Turbopack Compiled |
| **API Gateway** | REST / WebSocket Service | FastAPI 0.115 + Uvicorn | Async Python (Render) |
| **Security Layer** | PII Masking Engine | Python `re` Regular Expressions | Deterministic Sub-millisecond |
| **NLP Engine** | Intent Classification | scikit-learn (TF-IDF + Logistic Regression) | CPU In-Memory ($\approx 5$ms) |
| **NLP Engine** | Named Entity Extraction | spaCy (`en_core_web_sm`) + Regex | CPU In-Memory ($\approx 15$ms) |
| **Emotion Engine** | Sentiment & Escalation | VADER SentimentIntensityAnalyzer | CPU In-Memory ($\approx 2$ms) |
| **Optimization** | Copy Selection | Epsilon-Greedy Contextual Bandit | Online Learning ($\approx 1$ms) |
| **Generative AI** | Deep Reasoning Fallback | Groq Llama 3.3 / OpenRouter Free Models | Async Cloud LPU/GPU API |
| **Multimodal** | File Extraction | `pypdf`, `python-docx`, `Pillow` | Synchronous / Async Stream |
| **Session State** | Contextual Turn Window | Redis 7+ / In-Memory Dictionary | 1800s Rolling TTL |
| **Analytics DB** | Relational Audit Log | SQLite (Dev) / PostgreSQL (Prod) | SQLAlchemy 2.0 ORM |
