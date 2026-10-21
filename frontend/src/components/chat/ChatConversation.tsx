'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Video, Image as ImageIcon, BookOpen } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';

interface ChatConversationProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSelectStarterPrompt: (promptText: string) => void;
  onFeedback?: (turnId: number | undefined, rating: 1 | 0) => void;
}

export default function ChatConversation({
  messages,
  isLoading,
  onSelectStarterPrompt,
  onFeedback,
}: ChatConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const starterPrompts = [
    {
      title: 'Learn Something New',
      prompt: 'Can you teach me a core concept from modern software architecture?',
      icon: <BookOpen className="h-4 w-4 text-[#6658E8]" />,
      desc: 'Explore ideas, architectural principles, or concepts',
    },
    {
      title: 'Explore Document Analysis',
      prompt: 'How does the system extract structured clauses and tables from PDF, Word, and PPT files?',
      icon: <FileText className="h-4 w-4 text-[#15803D]" />,
      desc: 'Verify ingestion for .pdf, .doc, .docx, .ppt, .pptx',
    },
    {
      title: 'Explore Image Analysis',
      prompt: 'What visual inspection and OCR capabilities are supported for PNG and JPG imagery?',
      icon: <ImageIcon className="h-4 w-4 text-[#6658E8]" />,
      desc: 'Examine high-fidelity OCR for .png, .jpg',
    },
    {
      title: 'Explore Video Analysis',
      prompt: 'How does video analysis pinpoint timeline timestamps in MP4 and AVI files?',
      icon: <Video className="h-4 w-4 text-[#8D7CF5]" />,
      desc: 'Review timestamp alignment for .mp4, .avi',
    },
  ];

  const isEmpty = messages.length === 0;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 space-y-4">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Empty State with Exact 4 Starter Prompts (Section 5 Spec) */}
        {isEmpty && (
          <div className="py-12 sm:py-20 text-center space-y-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#6658E8] shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202238]">
                What would you like to explore?
              </h2>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-[#777C94]">
                Select a starter suggestion below to populate the composer, or write your own inquiry with multi-format attachments.
              </p>
            </div>

            {/* 4 Starter Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto text-left">
              {starterPrompts.map((starter) => (
                <button
                  key={starter.title}
                  type="button"
                  onClick={() => onSelectStarterPrompt(starter.prompt)}
                  className="flex items-start gap-3 rounded-2xl border border-[#E9E9F2] bg-white p-4 shadow-xs hover:border-[#6658E8] hover:bg-[#F0EDFF]/30 transition-all text-left group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FAFAFC] border border-[#E9E9F2] shadow-2xs group-hover:bg-white">
                    {starter.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#202238] group-hover:text-[#6658E8]">
                      {starter.title}
                    </span>
                    <span className="text-[11px] text-[#777C94] mt-0.5 leading-snug">
                      {starter.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onFeedback={onFeedback} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 py-2 text-xs text-[#777C94]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#6658E8] text-white">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FAFAFC] border border-[#E9E9F2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8D7CF5] animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#8D7CF5] animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#8D7CF5] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-[11px] font-medium text-[#777C94]">
                Generating illustrative reply...
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
