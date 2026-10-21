'use client';

import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageActionsProps {
  text: string;
  feedback?: 1 | 0 | null;
  onFeedback?: (rating: 1 | 0) => void;
}

export default function MessageActions({
  text,
  feedback,
  onFeedback,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#777C94]">
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white hover:text-[#202238] border border-transparent hover:border-[#E9E9F2] transition-colors"
        title="Copy response to clipboard"
        aria-label="Copy response"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-[#15803D]" />
            <span className="text-[#15803D]">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Helpful / Unhelpful Feedback */}
      {onFeedback && (
        <div className="flex items-center gap-1 ml-2 border-l border-[#E9E9F2] pl-2">
          <button
            type="button"
            onClick={() => onFeedback(1)}
            className={`p-1 rounded-md transition-colors ${
              feedback === 1 ? 'text-[#15803D] bg-[#E7F7F0]' : 'hover:bg-white text-[#777C94]'
            }`}
            title="Helpful response"
            aria-label="Mark helpful"
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onFeedback(0)}
            className={`p-1 rounded-md transition-colors ${
              feedback === 0 ? 'text-[#DC2626] bg-red-50' : 'hover:bg-white text-[#777C94]'
            }`}
            title="Unhelpful response"
            aria-label="Mark unhelpful"
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
