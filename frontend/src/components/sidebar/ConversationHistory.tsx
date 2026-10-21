'use client';

import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X, AlertTriangle, Pin } from 'lucide-react';
import { ConversationSession } from '@/types/chat';

interface ConversationHistoryProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isExpanded: boolean;
  searchQuery: string;
}

export default function ConversationHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isExpanded,
  searchQuery,
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<ConversationSession | null>(null);

  const startRename = (s: ConversationSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const confirmRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const requestDelete = (s: ConversationSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(s);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  if (sessions.length === 0) {
    if (!isExpanded) return null;
    return (
      <div className="py-8 text-center text-xs text-[#9BA0B8]">
        {searchQuery ? 'No matching conversations' : 'No saved conversations'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
      {sessions.map((s) => {
        const isActive = s.id === activeSessionId;
        const isEditing = editingId === s.id;

        return (
          <div
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={`group relative flex items-center gap-2.5 rounded-xl p-2 text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-[#F0EDFF] text-[#6658E8] font-semibold border border-[#8D7CF5]/40 shadow-xs'
                : 'text-[#777C94] hover:bg-[#FAFAFC] hover:text-[#202238]'
            } ${!isExpanded ? 'justify-center px-0' : ''}`}
            title={s.title}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <MessageSquare
                className={`h-4 w-4 ${isActive ? 'text-[#6658E8]' : 'text-[#9BA0B8]'}`}
              />
            </div>

            {isExpanded && (
              <>
                {isEditing ? (
                  <form
                    onSubmit={(e) => confirmRename(s.id, e)}
                    className="flex flex-1 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="w-full rounded-md border border-[#6658E8] bg-white px-1.5 py-0.5 text-xs text-[#202238] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => confirmRename(s.id, e)}
                      className="p-1 text-[#15803D] hover:bg-[#E7F7F0] rounded"
                      title="Save title"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="p-1 text-[#DC2626] hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-1 flex-col overflow-hidden text-left pr-12">
                      <span className="truncate font-medium text-[11px] text-[#202238]">
                        {s.title || 'Untitled Conversation'}
                      </span>
                      <span className="text-[10px] text-[#9BA0B8]">{s.updatedAt}</span>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-inherit rounded transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => startRename(s, e)}
                        className="p-1 text-[#777C94] hover:text-[#6658E8] hover:bg-white rounded"
                        title="Rename conversation"
                        aria-label="Rename conversation"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => requestDelete(s, e)}
                        className="p-1 text-[#777C94] hover:text-[#DC2626] hover:bg-white rounded"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Accessible Confirmation Dialog for Deletion (Section 6 Spec) */}
      {sessionToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs"
          role="alertdialog"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E9E9F2] bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#DC2626]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-sm font-bold text-[#202238]">
                  Delete Conversation?
                </h3>
                <p className="text-xs text-[#777C94]">This record will be permanently removed.</p>
              </div>
            </div>

            <p className="text-xs text-[#777C94] bg-[#FAFAFC] p-3 rounded-xl border border-[#E9E9F2]">
              "{sessionToDelete.title}"
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="rounded-xl border border-[#E9E9F2] px-3.5 py-1.5 text-xs font-semibold text-[#777C94] hover:bg-[#FAFAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-[#DC2626] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
