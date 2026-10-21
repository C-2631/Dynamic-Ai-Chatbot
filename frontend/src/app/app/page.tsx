'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import DemoAuth from '@/components/auth/DemoAuth';
import MouseFollower from '@/components/ui/MouseFollower';
import { ConversationSession, UserProfile, ChatMessage } from '@/types/chat';
import {
  loadSavedSessions,
  saveSessions,
  loadUserProfile,
  saveUserProfile,
} from '@/lib/local-persistence';

export default function AppPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const loadedSessions = loadSavedSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].id);
    }

    const loadedUser = loadUserProfile();
    if (loadedUser) {
      setUser(loadedUser);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  useEffect(() => {
    saveUserProfile(user);
  }, [user]);

  const handleCreateNewSession = () => {
    const newId = 'session_' + Date.now();
    const newSession: ConversationSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    saveSessions(remaining);

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        handleCreateNewSession();
      }
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateSessionMessages = (
    sessionId: string,
    messages: ChatMessage[],
    newTitle?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          title: newTitle || s.title,
          messages,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  return (
    <>
      <MouseFollower />
      <ChatWorkspace
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onUpdateSessionMessages={handleUpdateSessionMessages}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
        onReturnHome={() => router.push('/')}
      />
      <DemoAuth
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(authenticatedUser) => setUser(authenticatedUser)}
      />
    </>
  );
}
