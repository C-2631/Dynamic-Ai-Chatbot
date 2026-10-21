'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  User,
  LogOut,
  Sparkles,
  Clock,
  Pin
} from 'lucide-react';
import { ConversationSession, UserProfile } from '@/types/chat';

interface SidebarProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  searchQuery,
  onSearchChange,
  user,
  onOpenAuth,
  onLogout,
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isPinned || isHovered;

  const filtered = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const contentMatch = s.messages.some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || contentMatch;
  });

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isExpanded ? 280 : 68 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="relative z-30 flex h-full flex-col border-r border-slate-200 bg-white/95 backdrop-blur-md shadow-xs select-none"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <span className="font-semibold text-slate-900 text-xs tracking-tight">Support Assistant</span>
              <span className="text-[10px] text-slate-400">Autonomous Core v2.0</span>
            </motion.div>
          )}
        </div>

        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`rounded-lg p-1.5 transition-colors ${
              isPinned ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            aria-label="Pin sidebar"
          >
            <Pin className={`h-3.5 w-3.5 ${isPinned ? 'rotate-45' : ''} transition-transform`} />
          </button>
        )}
      </div>

      {/* New Session Action */}
      <div className="p-2.5">
        <button
          type="button"
          onClick={onNewSession}
          className={`flex w-full items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-400 ${
            isExpanded ? 'px-3 justify-start' : 'justify-center'
          }`}
          title="Start new conversation"
        >
          <Plus className="h-4 w-4 shrink-0 text-indigo-600" />
          {isExpanded && <span>New Conversation</span>}
        </button>
      </div>

      {/* Live Search */}
      {isExpanded && (
        <div className="px-2.5 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* History Items */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filtered.length === 0 ? (
          isExpanded ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Clock className="h-5 w-5 stroke-1 mb-1 text-slate-300" />
              <p className="text-[11px]">No conversation found</p>
            </div>
          ) : null
        ) : (
          filtered.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group relative flex items-center gap-2.5 rounded-lg p-2.5 text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-900 font-medium border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={s.title}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {isExpanded && (
                  <>
                    <span className="flex-1 truncate pr-5">{s.title || 'Untitled Conversation'}</span>
                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(s.id, e)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="Delete conversation"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User / Authentication Footer */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/60">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-medium text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-xs font-semibold text-slate-800">{user.name}</span>
                  <span className="truncate text-[10px] text-slate-500">{user.email}</span>
                </div>
              )}
            </div>
            {isExpanded && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
              isExpanded ? 'justify-start px-3' : 'justify-center'
            }`}
            title="Sign in / Register"
          >
            <User className="h-4 w-4 shrink-0 text-slate-500" />
            {isExpanded && <span>Sign In / Register</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
