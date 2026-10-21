'use client';

import React, { useState } from 'react';
import { PanelLeft, Home, FileText, Share2, Star, Sparkles, Check, Zap, User } from 'lucide-react';
import { UserProfile, ModelOption } from '@/types/chat';
import ModelSelector from './ModelSelector';

interface ChatHeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onReturnHome: () => void;
  isSidebarExpanded?: boolean;
  isLiveMode?: boolean;
  user?: UserProfile | null;
  selectedModelId?: string;
  onSelectModel?: (model: ModelOption) => void;
  availableModels?: ModelOption[];
}

export default function ChatHeader({
  title,
  onToggleSidebar,
  onReturnHome,
  isSidebarExpanded = false,
  isLiveMode = false,
  user = null,
  selectedModelId = 'minimax/minimax-m3.1-flash:free',
  onSelectModel,
  availableModels,
}: ChatHeaderProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ECEEF6] bg-white px-6">
      {/* Left: Mobile Toggle & Conversation Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[#E9E9F2] text-[#8F95B2] hover:text-[#1E2038]"
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 overflow-hidden">
          <h1 className="text-lg font-bold text-[#1E2038] tracking-tight truncate max-w-[160px] sm:max-w-xs md:max-w-md">
            {title || 'New Chat'}
          </h1>

          {/* Mode Pill Indicator */}
          {isLiveMode ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live AI</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#ECEEF6] bg-[#F1F3FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C5CE7]">
              <span className="h-2 w-2 rounded-full bg-[#6C5CE7] animate-pulse" />
              <span>Hybrid Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Model Selector & Actions */}
      <div className="flex items-center gap-2.5">
        {onSelectModel && (
          <div className="mr-1">
            <ModelSelector
              selectedModelId={selectedModelId}
              onSelectModel={onSelectModel}
              models={availableModels}
            />
          </div>
        )}

        {isLiveMode && user && (
          <div className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
            <User className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold truncate max-w-[120px]">{user.name}</span>
          </div>
        )}

        {/* Export / Document Action */}
        <button
          type="button"
          onClick={() => alert(isLiveMode ? 'Chat transcripts are logged in the backend analytics database.' : 'Document export is prepared for production backend integration.')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E6F2] bg-white text-[#777C94] hover:text-[#1E2038] hover:bg-[#F8F9FD] shadow-2xs transition-colors cursor-pointer"
          title="Export conversation"
        >
          <FileText className="h-4 w-4" />
        </button>

        {/* Share Action */}
        <button
          type="button"
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E6F2] bg-white text-[#777C94] hover:text-[#1E2038] hover:bg-[#F8F9FD] shadow-2xs transition-colors cursor-pointer"
          title="Share conversation"
        >
          {copiedShare ? <Check className="h-4 w-4 text-[#15803D]" /> : <Share2 className="h-4 w-4" />}
        </button>

        {/* Star / Favorite in soft pill */}
        <button
          type="button"
          onClick={() => setIsStarred(!isStarred)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isStarred
              ? 'bg-[#ECE9FE] text-[#6C5CE7] shadow-xs'
              : 'bg-[#F1F3FB] text-[#8F95B2] hover:text-[#6C5CE7]'
          }`}
          title="Star conversation"
        >
          <Star className={`h-4 w-4 ${isStarred ? 'fill-[#6C5CE7]' : ''}`} />
        </button>

        {/* Return to Landing */}
        <button
          type="button"
          onClick={onReturnHome}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E6F2] bg-white px-3 py-2 text-xs font-semibold text-[#1E2038] shadow-2xs hover:bg-[#FAFAFD] transition-colors cursor-pointer ml-1"
          title="Return to Landing Page"
        >
          <Home className="h-3.5 w-3.5 text-[#8F95B2]" />
          <span className="hidden sm:inline">Landing</span>
        </button>
      </div>
    </header>
  );
}
