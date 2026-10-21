import { ChatMessage, UploadedAttachment } from '@/types/chat';
import { sendChatMessage, uploadAttachment } from '@/lib/api/client';

export interface ChatReplyResult {
  text: string;
  source: 'document' | 'video' | 'image' | 'faq' | 'template' | 'llm' | 'clarify' | 'handoff' | 'bandit';
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  turn_id?: number;
  intent?: string;
  confidence?: number;
  model?: string;
  provider?: string;
}

/**
 * Executes a live conversational AI query against the FastAPI backend (/api/chat and /api/upload).
 * Uploads any new attachments and routes the query to the live NLP/NER/Context pipeline with Groq or OpenRouter.
 */
export async function executeLiveChat(
  sessionId: string,
  userText: string,
  attachments?: UploadedAttachment[],
  model?: string,
  provider?: string
): Promise<ChatReplyResult> {
  const readyAttachmentsPayload: {
    filename: string;
    category: 'document' | 'video' | 'image';
    file_url?: string;
    extracted_text?: string;
    details?: Record<string, any>;
  }[] = [];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      readyAttachmentsPayload.push({
        filename: att.name,
        category: att.category,
        file_url: att.file_url,
        extracted_text: att.extracted_text,
        details: att.details,
      });
    }
  }

  const response = await sendChatMessage({
    session_id: sessionId,
    text: userText,
    channel: 'web',
    model,
    provider,
    attachments: readyAttachmentsPayload.length > 0 ? readyAttachmentsPayload : undefined,
  });

  return {
    text: response.reply,
    source: response.source,
    sentiment: response.sentiment,
    turn_id: response.turn_id,
    intent: response.intent,
    confidence: response.confidence,
    model: response.model,
    provider: response.provider,
  };
}
