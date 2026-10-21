'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  RotateCw,
  Pencil,
  ThumbsUp,
  TrendingUp,
  BarChart2,
  Hand,
  Mic,
  Activity,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage as ChatMessageType, UploadedAttachment } from '@/types/chat';
import { formatFileSize } from '@/lib/file-validation';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback?: (turnId: number | undefined, rating: 1 | 0) => void;
}

export default function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
    if (onFeedback) {
      onFeedback(message.turn_id, liked ? 0 : 1);
    }
  };

  const hasEmbeddedDashboard = isBot && (
    message.text.includes('2025, UX/UI will focus') ||
    message.text.includes('Dashboard') ||
    message.text.includes('visual representation')
  );

  const renderAttachmentTile = (att: UploadedAttachment) => {
    let icon = <FileText className="h-4 w-4 text-[#6C5CE7]" />;
    let bg = 'bg-[#F0EDFF]';
    if (att.category === 'video') {
      icon = <Video className="h-4 w-4 text-[#6C5CE7]" />;
      bg = 'bg-[#F0EDFF]';
    } else if (att.category === 'image') {
      icon = <ImageIcon className="h-4 w-4 text-[#6C5CE7]" />;
      bg = 'bg-[#F0EDFF]';
    }

    return (
      <div
        key={att.id}
        className="flex items-center gap-3 rounded-2xl border border-[#ECEEF6] bg-white p-3 shadow-xs max-w-[280px]"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col text-left overflow-hidden">
          <span className="truncate font-bold text-[#1E2038] text-xs">{att.name}</span>
          <span className="text-[11px] text-[#8F95B2]">{formatFileSize(att.size)}</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full py-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex flex-col max-w-[94%] sm:max-w-[82%] space-y-2 ${isBot ? 'items-start' : 'items-end'}`}>
        {/* Attachments if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.attachments.map(renderAttachmentTile)}
          </div>
        )}

        {/* Message Bubble Content */}
        {message.text && (
          <div
            className={`rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed ${
              isBot
                ? 'bg-transparent text-[#1E2038] pl-0 w-full'
                : 'bg-white text-[#1E2038] border border-[#ECEEF6] shadow-xs max-w-xl'
            }`}
          >
            {/* Sentiment tone warning badge for bot */}
            {isBot && message.sentiment?.label === 'negative' && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>We recognized your concern and prioritized this answer.</span>
              </div>
            )}

            {/* Markdown & Structured Content Renderer */}
            {isBot ? (
              <MarkdownRenderer content={message.text} />
            ) : (
              <div className="whitespace-pre-wrap">{message.text}</div>
            )}

            {/* Embedded Visual UI Cards */}
            {hasEmbeddedDashboard && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {/* Visual Card 1: Dashboard with Purple Area Graph & Metrics */}
                <div className="rounded-2xl border border-[#E9EAF4] bg-white p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1E2038]">Dashboard</span>
                    <Activity className="h-3.5 w-3.5 text-[#6C5CE7]" />
                  </div>
                  
                  {/* Purple Stylized Curve SVG */}
                  <div className="relative h-16 w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#F3F0FF] to-white p-1">
                    <svg viewBox="0 0 100 40" className="h-full w-full stroke-[#6C5CE7] fill-[#ECE9FE]/40" preserveAspectRatio="none">
                      <path d="M0,35 Q20,10 40,25 T80,8 T100,20 L100,40 L0,40 Z" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-[#8F95B2]">
                    <span className="text-[#6C5CE7] font-bold">22,456</span>
                    <span>4,766</span>
                    <span>2,491</span>
                  </div>
                </div>

                {/* Visual Card 2: Interactive Tactile Icons Card */}
                <div className="rounded-2xl border border-[#E9EAF4] bg-white p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECE9FE] text-[#6C5CE7]">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 text-[#15803D] text-[10px] font-bold">
                      <TrendingUp className="h-3 w-3" />
                      <span>+18%</span>
                    </div>
                  </div>

                  <div className="my-2 h-1 bg-[#F1F3FB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6C5CE7] rounded-full w-3/4" />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[#8F95B2]">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F1F3FB] text-[#6C5CE7]">
                      <Hand className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F1F3FB] text-[#6C5CE7]">
                      <Mic className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F1F3FB] text-[#6C5CE7]">
                      <BarChart2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Row for Assistant Messages (Copy, Refresh, Edit, Thumbs Up) */}
        {isBot && (
          <div className="flex items-center gap-2 pl-0.5 pt-1 text-[#A0A5BD]">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:text-[#1E2038] hover:bg-white transition-colors cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => alert('Regenerating response...')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:text-[#1E2038] hover:bg-white transition-colors cursor-pointer"
              title="Regenerate response"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => alert('Editing query...')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:text-[#1E2038] hover:bg-white transition-colors cursor-pointer"
              title="Edit response"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleLike}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                liked ? 'text-[#6C5CE7] bg-[#ECE9FE]' : 'hover:text-[#1E2038] hover:bg-white'
              }`}
              title="Helpful"
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-[#6C5CE7]' : ''}`} />
            </button>

            {message.source && (
              <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#777C94] bg-[#F1F3FB] px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7]" />
                <span>{message.source}</span>
              </span>
            )}

            {message.confidence !== undefined && (
              <span className="text-[10px] text-[#A0A5BD]">
                {Math.round(message.confidence * 100)}% match
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
