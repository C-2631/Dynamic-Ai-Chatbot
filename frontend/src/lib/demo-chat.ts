import { ChatMessage, UploadedAttachment } from '@/types/chat';

/**
 * Isolated Demo Service Adapter
 * Provides rich, beautifully structured and aligned responses for the interactive prototype
 * with tables, structured code snippets, formulas, and visual figures without consuming external API keys.
 */

export interface DemoReplyResult {
  text: string;
  source: 'document' | 'video' | 'image' | 'faq' | 'template';
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
}

export async function generateDemoReply(
  userText: string,
  attachments?: UploadedAttachment[]
): Promise<DemoReplyResult> {
  // Simulate natural fast local inference (350ms - 600ms)
  await new Promise((resolve) => setTimeout(resolve, 450));

  const lower = userText.toLowerCase();

  // 1. NLP / Machine Learning query
  if (lower.includes('nlp') || lower.includes('machine learning') || lower.includes('natural language')) {
    return {
      text: `## NLP in Machine Learning

**Natural Language Processing (NLP)** is the branch of machine learning that enables computers to understand, analyze, and generate human language.

### Core Modalities Handled

NLP systems work seamlessly with structured and unstructured real-world inputs:

- **Text Data**: Emails, product reviews, research articles, contracts, customer conversations.
- **Speech Audio**: Recorded interviews, meeting transcriptions, voice commands.
- **Multimodal Documents**: Invoices, slides, academic papers, legal agreements.

### Common NLP Tasks & Benchmarks

| Task | Description | Production Example | Evaluation Metric |
|---|---|---|---|
| Text Classification | Assigning semantic category labels | Spam detection, ticket routing | Accuracy, F1-Score |
| Sentiment Analysis | Detecting underlying emotional tone | Customer NPS, survey insights | Balanced Accuracy, AUC |
| Named Entity Recognition | Pinpointing entities (names, dates, orgs) | "Apple was founded by Steve Jobs" | Macro Precision & Recall |
| Machine Translation | Cross-lingual sequence transformation | English → French, Spanish | BLEU, METEOR |
| Question Answering | Grounded query comprehension | Enterprise chatbots, document search | Exact Match (EM), F1 |
| Text Summarization | Condensing documents into key points | Executive briefs, research abstracts | ROUGE-1, ROUGE-2, ROUGE-L |
| Speech-to-Text | Translating acoustic signals to tokens | Voice-to-text assistants | Word Error Rate (WER) |

### Modern NLP Architecture Pipeline

A typical machine-learning and deep-learning pipeline follows four sequential stages:

1. **Text Preprocessing**
   - Normalization, lowercasing, and whitespace canonicalization
   - Subword tokenization (Byte-Pair Encoding, WordPiece)
   - Stop-word filtering, punctuation stripping, and lemmatization

2. **Representation & Vector Embeddings**
   - **Sparse Representations**: Term Frequency-Inverse Document Frequency (TF-IDF):
   - **Dense Embeddings**: Word2Vec, GloVe, FastText
   - **Contextual Transformers**: Bidirectional embeddings from BERT and generative auto-regressive representations from GPT

3. **Mathematical Formulation: TF-IDF Weighting**
   - Term frequency: $\\text{TF}(t, d) = \\frac{f_{t,d}}{\\sum_{t' \\in d} f_{t',d}}$
   - Inverse document frequency: $\\text{IDF}(t, D) = \\log \\left( \\frac{1 + |D|}{1 + |\\{d \\in D : t \\in d\\}|} \\right) + 1$
   - Combined representation: $\\text{TF-IDF}(t, d, D) = \\text{TF}(t, d) \\times \\text{IDF}(t, D)$

4. **Model Architecture & Training**
   - **Statistical Baselines**: Multinomial Naive Bayes, Support Vector Machines, Logistic Regression
   - **Deep Sequence Models**: Bi-directional LSTMs with attention mechanisms
   - **Pre-trained Transformers**: RoBERTa, DistilBERT, T5, LLaMA, GPT architectures

### Implementation Example: TF-IDF & Logistic Regression

Here is a clean, self-contained Python implementation for sentiment classification:

\`\`\`python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# 1. Corpus Preparation
documents = [
    "I love this product, it works flawlessly",
    "This is terrible and completely broken",
    "Excellent quality and lightning fast delivery",
    "Very disappointing experience, would not recommend"
]
labels = [1, 0, 1, 0]  # 1 = Positive, 0 = Negative

# 2. Vectorization via TF-IDF n-grams
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_train = vectorizer.fit_transform(documents)

# 3. Model Training
model = LogisticRegression(max_iter=1000)
model.fit(X_train, labels)

# 4. Inference on Unseen Query
test_review = "I am very happy with the product and support"
prediction = model.predict(vectorizer.transform([test_review]))[0]

print("Prediction:", "Positive" if prediction == 1 else "Negative")
\`\`\`

### Generative AI and Retrieval-Augmented Generation (RAG)

Modern language pipelines couple vector search with generative architectures:
- **Zero-Shot / Few-Shot In-Context Prompting**: Direct task execution without weight modification.
- **RAG Integration**: Indexing vector databases (Chroma, Pinecone, FAISS) to retrieve exact document snippets before generation.
- **Hallucination Guardrails**: Strict ground-truth cross-referencing and confidence scoring.

### Operational Challenges & Mitigations

- **Polysemy & Sarcasm**: Resolved through multi-layer self-attention heads tracking bidirectional context.
- **Data Distribution Drift**: Managed with continuous learning loops and contextual bandit reinforcement.
- **Latency & Resource Constraints**: Addressed through FP16/INT8 quantization, ONNX runtime compilation, and speculative decoding.`,
      source: 'faq',
      sentiment: { label: 'positive', score: 0.4 },
    };
  }

  // 2. Multimodal attachment analysis scenario
  if (attachments && attachments.length > 0) {
    const primaryAttachment = attachments[0];
    
    if (primaryAttachment.category === 'document') {
      return {
        text: `### Verified Document Inspection: \`${primaryAttachment.name}\`

The document has been parsed and indexed through our verified ingestion pipeline.

| Metric | Property Value | Validation Status |
|---|---|---|
| Document Format | \`${primaryAttachment.extension.toUpperCase()}\` | Verified Compliant |
| File Size | ${(primaryAttachment.size / (1024 * 1024)).toFixed(2)} MB | Within Allowed 25MB Limit |
| Extracted Sections | Executive Summary, Clauses, Financial Deliverables | Indexed Successfully |

#### Extracted Key Takeaways
- **Structure**: The document adheres to standard corporate formatting with clear section demarcations.
- **Grounded Verification**: All answers concerning this file link directly to specific page and clause citations.

*What specific section, clause, or financial metric from \`${primaryAttachment.name}\` would you like to examine?*`,
        source: 'document',
        sentiment: { label: 'neutral', score: 0.1 },
      };
    }

    if (primaryAttachment.category === 'video') {
      return {
        text: `### Verified Video Timeline Telemetry: \`${primaryAttachment.name}\`

The video file has been validated against our media pipeline allowlist.

| Frame Timestamp | Sequence Classification | Visual Telemetry |
|---|---|---|
| \`00:01:24\` | Key Transition | Scene transition and header introduction |
| \`00:03:45\` | Primary Segment | Primary demonstration and interface walkthrough |
| \`00:06:12\` | Summary & Closing | Concluding summary and next-step actions |

- **Compliance**: Encoded in compliant \`${primaryAttachment.extension.replace('.', '').toUpperCase()}\` format.
- **Frame Index**: Keyframes indexed for targeted question answering.`,
        source: 'video',
        sentiment: { label: 'neutral', score: 0.1 },
      };
    }

    if (primaryAttachment.category === 'image') {
      return {
        text: `### Verified Visual Telemetry: \`${primaryAttachment.name}\`

Visual contours and high-contrast boundaries successfully parsed.

| Attribute | Inspected Specification | Analysis Result |
|---|---|---|
| Format | \`${primaryAttachment.extension.toUpperCase()}\` | Verified Whitelist |
| Image Resolution | High Resolution | Contrast & Quality Verified |
| Optical Elements | Structured diagram / text detected | OCR Indexing Complete |

*You can now ask questions about elements, text labels, or layout found inside \`${primaryAttachment.name}\`.*`,
        source: 'image',
        sentiment: { label: 'neutral', score: 0.15 },
      };
    }
  }

  // 3. Starter prompt queries
  if (lower.includes('learn something new') || lower.includes('software architecture')) {
    return {
      text: `### Architectural Pattern: Contextual Bandit Optimization

In modern distributed AI applications, **Contextual Bandits** provide a formal reinforcement framework balancing exploration with exploitation:

| Strategy | Operational Mechanism | Best Used For |
|---|---|---|
| A/B Testing | Static 50/50 split across a fixed test cohort | Preliminary hypothesis validation |
| Multi-Armed Bandit | Dynamically routes traffic toward top-performing variants | Dynamic response generation & CTR |
| Contextual Bandit | Considers user intent and history slots when selecting action | Personalized AI chatbots & recommendations |

#### Mathematical Objective
Maximizing cumulative expected reward over $T$ turns:
$$\\max \\sum_{t=1}^T \\mathbb{E}[R(a_t \\mid x_t)]$$

Where $x_t$ represents the conversation context vector, $a_t$ is the selected response variant, and $R$ is the explicit feedback score ($1$ for helpful, $0$ for unhelpful).`,
      source: 'faq',
      sentiment: { label: 'positive', score: 0.35 },
    };
  }

  if (lower.includes('explore document analysis') || lower.includes('document')) {
    return {
      text: `### Document Analysis Capabilities

Our document parser processes files using native byte extractors and tabular layout decoders:

| Supported Format | Supported Extensions | Parser Engine | Citation Support |
|---|---|---|---|
| Portable Document Format | \`.pdf\` | PyPDF & PDFMiner | Exact page numbers |
| Microsoft Word | \`.docx\`, \`.doc\` | python-docx | Paragraph and table indices |
| Microsoft PowerPoint | \`.pptx\`, \`.ppt\` | python-pptx | Slide index & notes |

#### Processing Workflow
1. **Magic Bytes Validation**: Verifies genuine file signatures.
2. **Text Normalization**: Strips decorative formatting while preserving layout.
3. **Semantic Chunking**: Splits into coherent chunks with sliding overlaps.
4. **Grounded Querying**: Cross-references user questions with indexed sections.`,
      source: 'template',
      sentiment: { label: 'neutral', score: 0.1 },
    };
  }

  if (lower.includes('explore image analysis') || lower.includes('image')) {
    return {
      text: `### Image Perception & OCR Pipeline

The visual perception module strictly enforces high-quality image parsing without hallucinated content:

| Feature | Technical Specification | Operational Target |
|---|---|---|
| Supported Extensions | \`.png\`, \`.jpg\` | Strict whitelist enforcement |
| Optical Character Recognition | LayoutLM & Tesseract OCR | Text extraction from documents & signs |
| Object Recognition | Zero-Shot Detection | Diagram, chart, and badge verification |

#### Security & Privacy Standard
Images are processed in memory and never shared with public third-party model training datasets.`,
      source: 'template',
      sentiment: { label: 'neutral', score: 0.1 },
    };
  }

  if (lower.includes('explore video analysis') || lower.includes('video')) {
    return {
      text: `### Video Analysis Pipeline

Our video processor evaluates footage using temporal sampling and audio transcription:

| Feature | Technical Specification | Result |
|---|---|---|
| Allowed Containers | \`.mp4\`, \`.avi\` | Compliant |
| Audio Demuxing | FFmpeg AAC/PCM stream separation | Whisper transcription ready |
| Temporal Keyframes | 1 frame per second scene change threshold | Event timestamp correlation |

*Attach any MP4 or AVI clip below to review timeline analysis!*`,
      source: 'template',
      sentiment: { label: 'neutral', score: 0.1 },
    };
  }

  // Default Fallback
  return {
    text: `### Assistant Ready

I am ready to help you explore natural language processing, order tracking, refunds, or analyze your files:

| Inquiry Domain | Supported Actions |
|---|---|
| Order Support | Track order status, shipment ETA, delivery resolution |
| Policy & Refunds | 30-day money-back guarantee, return initiation |
| Multimodal Files | Attach PDF, Word, PPT, MP4, AVI, PNG, or JPG files |

*What would you like to look into?*`,
    source: 'faq',
    sentiment: { label: 'neutral', score: 0.0 },
  };
}
