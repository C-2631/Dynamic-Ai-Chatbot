import { ChatApiRequest, ChatApiResponse, ModelOption } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function fetchAvailableModels(): Promise<{
  default_model: string;
  default_provider: string;
  groq_configured: boolean;
  openrouter_configured: boolean;
  models: ModelOption[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/models`);
  if (!res.ok) {
    throw new ApiError('Failed to fetch available models', res.status);
  }
  return await res.json();
}

export async function sendChatMessage(req: ChatApiRequest): Promise<ChatApiResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new ApiError(errText || 'Failed to send message', res.status);
  }

  return await res.json();
}

export async function uploadAttachment(file: File, sessionId: string): Promise<{
  status: string;
  filename: string;
  file_url: string;
  category: 'document' | 'video' | 'image';
  size_bytes: number;
  details?: Record<string, any>;
  extracted_text?: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let detail = 'File upload failed';
    try {
      const errJson = await res.json();
      if (errJson.detail) detail = errJson.detail;
    } catch {
      detail = await res.text();
    }
    throw new ApiError(detail, res.status);
  }

  return await res.json();
}

export async function sendFeedback(body: {
  session_id: string;
  rating: 1 | 0;
  intent?: string;
  variant?: string;
  message_id?: number;
}): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError('Feedback submission failed', res.status);
  }

  return await res.json();
}

export async function deleteServerSession(sessionId: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/session/${sessionId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new ApiError('Session deletion failed', res.status);
  }

  return await res.json();
}
