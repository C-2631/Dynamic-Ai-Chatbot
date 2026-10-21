'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Video,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, UploadedAttachment } from '@/types/chat';
import { formatBytes } from '@/lib/validation/files';

interface MessageItemProps {
  message: ChatMessage;
  onFeedback?: (turnId: number | undefined, rating: 1 | 0) => void;
}

export default function MessageItem({ message, onFeedback }: MessageItemProps) {
  const [copied, setCopied] = React.useState(false);
  const isBot = message.sender === 'bot';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIcon = (cat: string) => {
    if (cat === 'document') return <FileText className="h-4 w-4 text-indigo-700 shrink-0" />;
    if (cat === 'video') return <Video className="h-4 w-4 text-sky-700 shrink-0" />;
    return <ImageIcon className="h-4 w-4 text-emerald-700 shrink-0" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full gap-3 py-2 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[72%] space-y-1.5 ${isBot ? 'items-start' : 'items-end'}`}>
        {/* Attachment references if present */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-xs"
              >
                {renderIcon(file.category)}
                <div className="flex flex-col text-left max-w-[140px]">
                  <span className="truncate font-medium text-slate-800">{file.name}</span>
                  <span className="text-[10px] text-slate-400">{formatBytes(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative group rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-xs ${
            isBot
              ? 'bg-[#F0F3F8] text-[#12161F] border border-slate-200/60 rounded-tl-xs'
              : 'bg-indigo-600 text-white rounded-tr-xs'
          }`}
        >
          {/* Sentiment acknowledgment banner */}
          {isBot && message.sentiment?.label === 'negative' && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>We detected your concern and prioritized this response.</span>
            </div>
          )}

          {/* Formatted Text */}
          <div className="whitespace-pre-wrap">{message.text}</div>

          {/* Copy Action Overlay */}
          <button
            type="button"
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
              isBot ? 'text-slate-400 hover:bg-slate-200/60 text-slate-600' : 'text-indigo-200 hover:bg-indigo-500 text-white'
            }`}
            title="Copy response"
            aria-label="Copy response text"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        {/* Footer Meta & Feedback for Bot */}
        <div className="flex items-center gap-2.5 px-1 text-[11px] text-slate-400">
          <span>{message.timestamp}</span>

          {isBot && message.source && (
            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider text-slate-600">
              {message.source}
            </span>
          )}

          {/* Thumbs up / down feedback */}
          {isBot && onFeedback && (
            <div className="flex items-center gap-1 ml-1.5">
              <button
                type="button"
                onClick={() => onFeedback(message.turn_id, 1)}
                className={`p-1 rounded transition-colors ${
                  message.feedback === 1
                    ? 'text-indigo-700 bg-indigo-100'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Helpful"
                aria-label="Mark reply as helpful"
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onFeedback(message.turn_id, 0)}
                className={`p-1 rounded transition-colors ${
                  message.feedback === 0
                    ? 'text-red-700 bg-red-100'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Not helpful"
                aria-label="Mark reply as unhelpful"
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-xs">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
