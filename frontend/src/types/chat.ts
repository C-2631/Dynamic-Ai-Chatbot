export type FileCategory = 'document' | 'video' | 'image';

export interface UploadedAttachment {
  id: string;
  name: string;
  size: number;
  category: FileCategory;
  extension: string;
  file_url?: string;
  extracted_text?: string;
  details?: Record<string, any>;
  previewUrl?: string;
  status: 'validating' | 'uploading' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'openrouter' | 'groq';
  badge: string;
  description: string;
  category: 'openrouter' | 'groq';
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  attachments?: UploadedAttachment[];
  source?: 'faq' | 'template' | 'llm' | 'clarify' | 'handoff' | 'document' | 'video' | 'image' | 'bandit';
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  intent?: string;
  confidence?: number;
  turn_id?: number;
  feedback?: 1 | 0 | null;
  slots?: Record<string, any>;
  model?: string;
  provider?: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
}

export interface ChatApiRequest {
  session_id: string;
  text: string;
  channel?: string;
  model?: string;
  provider?: string;
  attachments?: {
    filename: string;
    category: FileCategory;
    file_url?: string;
    extracted_text?: string;
    details?: Record<string, any>;
  }[];
}

export interface ChatApiResponse {
  reply: string;
  source: 'faq' | 'template' | 'llm' | 'clarify' | 'handoff' | 'document' | 'video' | 'image' | 'bandit';
  intent: string;
  confidence: number;
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  entities: Record<string, any>;
  slots: Record<string, any>;
  turn_id: number;
  session_id: string;
  latency_ms: number;
  model?: string;
  provider?: string;
}
