'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MoreHorizontal, Paperclip, Image as ImageIcon, AudioLines, Send } from 'lucide-react';
import AttachmentMenu from '../attachments/AttachmentMenu';
import AttachmentPreview from '../attachments/AttachmentPreview';
import { UploadedAttachment } from '@/types/chat';
import { validateSelectedFile } from '@/lib/file-validation';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  attachments: UploadedAttachment[];
  onFilesValidated: (newFiles: UploadedAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  onError: (msg: string) => void;
}

export default function ChatComposer({
  input,
  setInput,
  onSend,
  isLoading,
  attachments,
  onFilesValidated,
  onRemoveAttachment,
  onError,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-resize textarea up to 5 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachments.length > 0) && !isLoading) {
        onSend();
      }
    }
  };

  const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !isLoading;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6 pt-2">
      <div
        className={`relative rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
          isFocused ? 'border-[#6C5CE7] ring-2 ring-[#ECE9FE]' : 'border-[#E4E6F2]'
        }`}
      >
        {/* Attachment Preview Chips */}
        <AttachmentPreview
          attachments={attachments}
          onRemove={onRemoveAttachment}
        />

        {/* Text Input Row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          {/* Expanding Multiline Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              placeholder="Ask something..."
              className="w-full resize-none bg-transparent py-1.5 text-xs sm:text-sm text-[#1E2038] placeholder-[#A0A5BD] focus:outline-none leading-relaxed max-h-36 overflow-y-auto"
            />
          </div>

          {/* Right Controls Container */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* More options button */}
            <button
              type="button"
              onClick={() => onError('Advanced model parameters (Temperature, Top-P) available in production.')}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A0A5BD] hover:text-[#1E2038] hover:bg-[#F4F5FB] transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Paperclip Attachment Menu Toggle */}
            <div className="relative">
              <AttachmentMenu
                onFilesValidated={onFilesValidated}
                onError={onError}
                existingAttachmentNames={attachments.map((a) => a.name)}
                disabled={isLoading}
              />
            </div>

            {/* Image Quick Trigger Button */}
            <button
              type="button"
              onClick={() => {
                const inputEl = document.createElement('input');
                inputEl.type = 'file';
                inputEl.accept = '.png,.jpg';
                inputEl.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const result = validateSelectedFile(file, attachments.map((a) => a.name));
                    if (!result.valid) {
                      onError(result.error || 'Only .png and .jpg image formats are accepted in this prototype.');
                    } else if (result.category === 'image') {
                      onFilesValidated([
                        {
                          id: 'att_' + Date.now(),
                          name: file.name,
                          size: file.size,
                          category: 'image',
                          extension: result.extension || '.png',
                          status: 'ready',
                          previewUrl: URL.createObjectURL(file),
                        },
                      ]);
                    }
                  }
                };
                inputEl.click();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A0A5BD] hover:text-[#1E2038] hover:bg-[#F4F5FB] transition-colors cursor-pointer"
              title="Attach Image (.png, .jpg)"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* Signature Purple Waveform / Send Action Button */}
            <button
              type="button"
              onClick={onSend}
              disabled={!canSubmit}
              title={canSubmit ? 'Send message' : 'Voice / Submit message'}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs ${
                canSubmit
                  ? 'bg-gradient-to-tr from-[#6C5CE7] to-[#8C7BFA] text-white hover:opacity-95 active:scale-95'
                  : 'bg-[#6C5CE7] text-white opacity-90 hover:opacity-100'
              }`}
            >
              {canSubmit ? (
                <Send className="h-4 w-4" />
              ) : (
                <AudioLines className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] text-[#A0A5BD]">
        Interactive Prototype Demo &bull; Illustrative responses without live AI connectivity
      </div>
    </div>
  );
}
