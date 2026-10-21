'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Star,
  Folder,
  LayoutGrid,
  Settings,
  Sparkles,
  Search,
  MoreHorizontal,
  PanelLeftClose,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Trash2,
  Edit2
} from 'lucide-react';
import { ConversationSession, UserProfile } from '@/types/chat';

interface ChatSidebarProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onReturnHome: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  searchQuery,
  onSearchChange,
  user,
  onOpenAuth,
  onLogout,
  onReturnHome,
  isMobileOpen = false,
  onCloseMobile,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'starred' | 'folders' | 'grid'>('chats');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const contentMatch = s.messages.some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || contentMatch;
  });

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const todaySessions = filteredSessions.filter((s) => !s.pinned && (s.createdAt.includes('AM') || s.createdAt.includes('PM') || s.createdAt.toLowerCase() === 'today'));
  const yesterdaySessions = filteredSessions.filter((s) => s.createdAt.toLowerCase().includes('yesterday') || s.createdAt.includes('2:15 PM') || s.createdAt.includes('4:15 PM'));
  const olderSessions = filteredSessions.filter((s) => !s.pinned && !todaySessions.includes(s) && !yesterdaySessions.includes(s));

  const handleStartRename = (s: ConversationSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full shrink-0 select-none bg-[#FAFAFD]">
      {/* 1. Far Left Slim Icon Rail */}
      <div className="flex w-[68px] flex-col items-center justify-between border-r border-[#ECEEF6] bg-[#FAFAFD] py-5 px-2">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-5">
          <button
            type="button"
            onClick={onReturnHome}
            title="Return to Landing Page"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
          >
            {/* 4-petal geometric logo icon */}
            <div className="relative h-5 w-5 grid grid-cols-2 gap-1 p-0.5">
              <span className="rounded-full bg-white/90" />
              <span className="rounded-full bg-white/70" />
              <span className="rounded-full bg-white/80" />
              <span className="rounded-full bg-white" />
            </div>
          </button>

          {/* Upper Dock Pill Container */}
          <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-[#F1F3FB] p-1.5">
            {/* + New Chat Button */}
            <button
              type="button"
              onClick={onNewSession}
              title="New Chat"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7BFA] text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>

            {/* Chat Bubble Icon */}
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                activeTab === 'chats' ? 'text-[#6C5CE7] bg-white shadow-2xs' : 'text-[#8F95B2] hover:text-[#1E2038]'
              }`}
              title="Recent Chats"
            >
              <MessageSquare className="h-4.5 w-4.5" />
            </button>

            {/* Favorites / Star Icon */}
            <button
              type="button"
              onClick={() => setActiveTab('starred')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                activeTab === 'starred' ? 'text-[#6C5CE7] bg-white shadow-2xs' : 'text-[#8F95B2] hover:text-[#1E2038]'
              }`}
              title="Starred Chats"
            >
              <Star className="h-4.5 w-4.5" />
            </button>

            {/* Folders Icon */}
            <button
              type="button"
              onClick={() => setActiveTab('folders')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                activeTab === 'folders' ? 'text-[#6C5CE7] bg-white shadow-2xs' : 'text-[#8F95B2] hover:text-[#1E2038]'
              }`}
              title="Knowledge Folders"
            >
              <Folder className="h-4.5 w-4.5" />
            </button>

            {/* Grid Apps Icon */}
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                activeTab === 'grid' ? 'text-[#6C5CE7] bg-white shadow-2xs' : 'text-[#8F95B2] hover:text-[#1E2038]'
              }`}
              title="Explore Workspaces"
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Lower Dock Pill Container */}
        <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-[#F1F3FB] p-1.5">
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8F95B2] hover:text-[#1E2038] hover:bg-white/60 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8F95B2] hover:text-[#6C5CE7] hover:bg-white/60 transition-colors cursor-pointer"
            title="Interactive Features"
          >
            <Sparkles className="h-4.5 w-4.5" />
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-[#D5D8E8] shadow-2xs cursor-pointer hover:ring-2 hover:ring-[#6C5CE7]"
            title={user ? user.name : 'Sign In'}
          >
            <div className="h-full w-full bg-gradient-to-tr from-[#9B8CFA] to-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
        </div>
      </div>

      {/* 2. Middle Panel: Recent Chats List */}
      <div className="flex w-[290px] lg:w-[310px] flex-col border-r border-[#ECEEF6] bg-[#FAFAFD] h-full overflow-hidden">
        {/* Header: Title + Count Badge + Collapse Button */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#1E2038] tracking-tight">Recent Chats</h2>
            <span className="flex h-5 items-center justify-center rounded-full bg-[#ECE9FE] px-2 text-[11px] font-bold text-[#6C5CE7]">
              {sessions.length || 40}
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8F95B2] hover:text-[#1E2038] hover:bg-[#F1F3FB] transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-[#A0A5BD]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search in chats..."
              className="w-full rounded-xl border border-[#E4E6F2] bg-white py-2 pl-9 pr-3 text-xs text-[#1E2038] placeholder:text-[#A0A5BD] focus:border-[#6C5CE7] focus:outline-none transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-5 pb-6">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold tracking-wider text-[#A0A5BD]">
                Pinned chats
              </div>
              <div className="space-y-1">
                {pinnedSessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession(s.id)}
                      className={`group relative flex items-center justify-between rounded-2xl p-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ECE9FE] to-[#F5F3FF] border border-[#DDD6FE] shadow-xs'
                          : 'bg-transparent hover:bg-white hover:border hover:border-[#E8EAF4]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <Star className="h-3.5 w-3.5 text-[#6C5CE7] shrink-0 mt-0.5 fill-[#6C5CE7]" />
                        <div className="flex flex-col overflow-hidden">
                          {editingId === s.id ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleSaveRename(s.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(s.id)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border border-[#6C5CE7] bg-white px-1 text-xs font-semibold text-[#1E2038]"
                            />
                          ) : (
                            <span className="truncate text-xs font-bold text-[#1E2038]">
                              {s.title}
                            </span>
                          )}
                          <span className="text-[10px] text-[#A0A5BD] mt-0.5">{s.createdAt}</span>
                        </div>
                      </div>

                      {/* More Menu */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === s.id ? null : s.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[#A0A5BD] hover:text-[#1E2038] hover:bg-white/80 cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {menuOpenId === s.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 z-50 w-28 rounded-xl border border-[#E4E6F2] bg-white py-1 shadow-lg text-xs"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(s, e)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-[#1E2038] hover:bg-[#F4F5FB]"
                            >
                              <Edit2 className="h-3 w-3 text-[#6C5CE7]" />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteSession(s.id);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-[#DC2626] hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today */}
          {todaySessions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold tracking-wider text-[#A0A5BD]">
                Today
              </div>
              <div className="space-y-1">
                {todaySessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession(s.id)}
                      className={`group relative flex items-center justify-between rounded-2xl p-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ECE9FE] to-[#F5F3FF] border border-[#DDD6FE] shadow-xs'
                          : 'hover:bg-white hover:border hover:border-[#E8EAF4]'
                      }`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-xs font-semibold text-[#1E2038]">
                          {s.title}
                        </span>
                        <span className="text-[10px] text-[#A0A5BD] mt-0.5">{s.createdAt}</span>
                      </div>
                      <MoreHorizontal className="h-3.5 w-3.5 text-[#A0A5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {yesterdaySessions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold tracking-wider text-[#A0A5BD]">
                Yesterday
              </div>
              <div className="space-y-1">
                {yesterdaySessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  const hasChartThumbnails = s.title.includes('Dashboard') || s.title.includes('CRM');
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession(s.id)}
                      className={`group relative flex flex-col rounded-2xl p-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ECE9FE] to-[#F5F3FF] border border-[#DDD6FE] shadow-xs'
                          : 'hover:bg-white hover:border hover:border-[#E8EAF4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-xs font-semibold text-[#1E2038]">
                            {s.title}
                          </span>
                          <span className="text-[10px] text-[#A0A5BD] mt-0.5">{s.createdAt}</span>
                        </div>
                        <MoreHorizontal className="h-3.5 w-3.5 text-[#A0A5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Mini Data Visual Charts Preview Row (as seen in reference image) */}
                      {hasChartThumbnails && (
                        <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-[#ECEEF6]">
                          <div className="flex h-5 w-8 items-center justify-center rounded bg-[#F0EDFF] text-[#6C5CE7]">
                            <BarChart2 className="h-3 w-3" />
                          </div>
                          <div className="flex h-5 w-8 items-center justify-center rounded bg-[#F0EDFF] text-[#6C5CE7]">
                            <TrendingUp className="h-3 w-3" />
                          </div>
                          <div className="flex h-5 w-8 items-center justify-center rounded bg-[#F0EDFF] text-[#6C5CE7]">
                            <BarChart2 className="h-3 w-3" />
                          </div>
                          <span className="ml-auto rounded-full bg-[#EBE8FC] px-1.5 py-0.2 text-[9px] font-bold text-[#6C5CE7]">
                            +3
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Older Chats */}
          {olderSessions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold tracking-wider text-[#A0A5BD]">
                March 29, 2025
              </div>
              <div className="space-y-1">
                {olderSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className="group relative flex items-center justify-between rounded-2xl p-3 text-left hover:bg-white hover:border hover:border-[#E8EAF4] transition-all cursor-pointer"
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-semibold text-[#1E2038]">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-[#A0A5BD] mt-0.5">{s.createdAt}</span>
                    </div>
                    <MoreHorizontal className="h-3.5 w-3.5 text-[#A0A5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
