'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from '@/components/landing/LandingPage';
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

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize state from local persistence on mount
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

    // Check if URL specifies workspace
    if (typeof window !== 'undefined' && window.location.hash === '#workspace') {
      setCurrentView('workspace');
    }
  }, []);

  // Save sessions to localStorage on update
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // Save user profile to localStorage on update
  useEffect(() => {
    saveUserProfile(user);
  }, [user]);

  const handleCreateNewSession = () => {
    const newId = 'session_' + Date.now();
    const newSession: ConversationSession = {
      id: newId,
      title: user ? 'Live Session' : 'New Chat',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: user
        ? [
            {
              id: 'init_' + Date.now(),
              sender: 'bot',
              text: `Hello ${user.name}! You are in Live AI Chatbot mode. You can ask questions about your orders, accounts, refunds, or attach any document (.pdf, .docx, .doc, .pptx, .ppt), video (.mp4, .avi), or image (.png, .jpg) for verified analysis.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'faq',
            },
          ]
        : [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setCurrentView('workspace');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentView('workspace');
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

  const handleOpenWorkspace = () => {
    setCurrentView('workspace');
    if (typeof window !== 'undefined') {
      window.location.hash = 'workspace';
    }
  };

  const handleReturnHome = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);
    // Transition straight into the live chatbot workspace upon sign in
    setCurrentView('workspace');
    if (typeof window !== 'undefined') {
      window.location.hash = 'workspace';
    }

    // Ensure a session exists for the user
    if (sessions.length === 0 || !activeSessionId) {
      handleCreateNewSession();
    }
  };

  const handleLogout = () => {
    setUser(null);
    saveUserProfile(null);
  };

  return (
    <>
      {/* Precision Mouse Follower with Reduced Motion Guard */}
      <MouseFollower />

      {currentView === 'landing' ? (
        <LandingPage
          onOpenWorkspace={handleOpenWorkspace}
          onOpenSignIn={() => setIsAuthOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      ) : (
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
          onLogout={handleLogout}
          onReturnHome={handleReturnHome}
        />
      )}

      {/* Authentication Modal */}
      <DemoAuth
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
