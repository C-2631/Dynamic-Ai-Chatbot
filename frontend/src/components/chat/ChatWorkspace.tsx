'use client';

import React, { useState } from 'react';
import ChatSidebar from '../sidebar/ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatConversation from './ChatConversation';
import ChatComposer from './ChatComposer';
import ToastNotification, { ToastMessage } from '../ui/ToastNotification';
import { ConversationSession, UploadedAttachment, UserProfile, ChatMessage } from '@/types/chat';
import { generateDemoReply } from '@/lib/demo-chat';
import { executeLiveChat } from '@/lib/live-chat';
import { uploadAttachment } from '@/lib/api/client';

interface ChatWorkspaceProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onUpdateSessionMessages: (sessionId: string, messages: ChatMessage[], newTitle?: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onReturnHome: () => void;
}

export default function ChatWorkspace({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onUpdateSessionMessages,
  user,
  onOpenAuth,
  onLogout,
  onReturnHome,
}: ChatWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('minimax/minimax-m3.1-flash:free');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isLiveMode = !!user;

  const addToast = (type: 'error' | 'success' | 'info', message: string, title?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userText = input.trim();
    const currentAttachments = [...attachments];

    // Clear composer
    setInput('');
    setAttachments([]);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const isFirstUserMessage = (currentSession?.messages || []).filter((m) => m.sender === 'user').length === 0;
    const newTitle = isFirstUserMessage && userText
      ? userText.length > 28 ? userText.substring(0, 28) + '...' : userText
      : undefined;

    const nextMessages = [...(currentSession?.messages || []), userMsg];
    onUpdateSessionMessages(currentSession.id, nextMessages, newTitle);

    setIsLoading(true);

    try {
      // First attempt Live AI backend with selected Groq/OpenRouter model
      try {
        const liveResult = await executeLiveChat(
          currentSession.id,
          userText,
          currentAttachments,
          selectedModel
        );

        const botMsg: ChatMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: liveResult.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: liveResult.source,
          sentiment: liveResult.sentiment,
          turn_id: liveResult.turn_id,
          intent: liveResult.intent,
          confidence: liveResult.confidence,
          model: liveResult.model || selectedModel,
          provider: liveResult.provider,
        };

        onUpdateSessionMessages(currentSession.id, [...nextMessages, botMsg]);
        return;
      } catch (liveErr: any) {
        // If user was explicitly expecting live mode, notify them of fallback
        if (isLiveMode) {
          addToast('info', 'Backend connecting... switching to instant prototype mode.');
        }
      }

      // Fallback: Illustrative prototype reply
      const demoResult = await generateDemoReply(userText, currentAttachments);

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: demoResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: demoResult.source,
        sentiment: demoResult.sentiment,
        model: selectedModel,
      };

      onUpdateSessionMessages(currentSession.id, [...nextMessages, botMsg]);
    } catch {
      addToast('error', 'Could not generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStarterPrompt = (promptText: string) => {
    setInput(promptText);
  };

  const handleFilesValidated = async (newFiles: UploadedAttachment[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);

    // If live mode, proactively upload the files to backend
    if (isLiveMode && currentSession) {
      for (const fileObj of newFiles) {
        try {
          if (fileObj.previewUrl && (fileObj as any).rawFile) {
            const rawFile = (fileObj as any).rawFile as File;
            const res = await uploadAttachment(rawFile, currentSession.id);
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === fileObj.id
                  ? {
                      ...a,
                      file_url: res.file_url,
                      extracted_text: res.extracted_text,
                      details: res.details,
                      status: 'ready',
                    }
                  : a
              )
            );
          }
        } catch {
          // Keep file in attachments tray so user can still submit
        }
      }
    }

    addToast(
      'success',
      `Attached ${newFiles.length} file(s) for ${isLiveMode ? 'Live Multimodal Analysis' : 'demo inquiry'}.`
    );
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#DFE4F2] p-2 sm:p-4 lg:p-6 flex items-center justify-center text-[#1E2038]">
      {/* Floating App Canvas Frame */}
      <div className="relative flex h-[96vh] max-h-[960px] w-full max-w-[1540px] overflow-hidden rounded-[28px] border border-[#D5DBEC] bg-white shadow-2xl">
        {/* Left: Combined Icon Rail & Recent Chats Sidebar */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onDeleteSession={onDeleteSession}
          onRenameSession={onRenameSession}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
          onReturnHome={onReturnHome}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right: Active Chat Region */}
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-white">
          {/* Header */}
          <ChatHeader
            title={currentSession?.title || 'New Chat'}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onReturnHome={onReturnHome}
            isLiveMode={isLiveMode}
            user={user}
            selectedModelId={selectedModel}
            onSelectModel={(m) => setSelectedModel(m.id)}
          />

          {/* Messages Area */}
          <ChatConversation
            messages={currentSession?.messages || []}
            isLoading={isLoading}
            onSelectStarterPrompt={handleSelectStarterPrompt}
            onFeedback={() => addToast('info', isLiveMode ? 'Feedback recorded in live bandit learning engine.' : 'Feedback logged in prototype local state.')}
          />

          {/* Composer */}
          <div className="shrink-0 bg-white">
            <ChatComposer
              input={input}
              setInput={setInput}
              onSend={handleSendMessage}
              isLoading={isLoading}
              attachments={attachments}
              onFilesValidated={handleFilesValidated}
              onRemoveAttachment={handleRemoveAttachment}
              onError={(msg) => addToast('error', msg)}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
