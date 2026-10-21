import { ConversationSession, UserProfile } from '@/types/chat';
import { SAMPLE_CONVERSATIONS } from '@/data/demo-conversations';

const SESSIONS_STORAGE_KEY = 'dynamic_ai_prototype_sessions';
const USER_STORAGE_KEY = 'dynamic_ai_prototype_user';

export function loadSavedSessions(): ConversationSession[] {
  if (typeof window === 'undefined') return SAMPLE_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasRefSession = parsed.some((s: any) => s.id === 'demo_session_ref');
        if (!hasRefSession) {
          return [...SAMPLE_CONVERSATIONS, ...parsed];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load sessions from local storage, falling back to samples:', e);
  }
  return SAMPLE_CONVERSATIONS;
}

export function saveSessions(sessions: ConversationSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to persist sessions to local storage:', e);
  }
}

export function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveUserProfile(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}
