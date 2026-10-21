'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface ConversationSearchProps {
  query: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
}

export default function ConversationSearch({
  query,
  onChange,
  isExpanded,
}: ConversationSearchProps) {
  if (!isExpanded) {
    return (
      <div className="flex justify-center p-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAFAFC] text-[#777C94] border border-[#E9E9F2]">
          <Search className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-2">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9BA0B8]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-[#E9E9F2] bg-[#FAFAFC] py-1.5 pl-8 pr-7 text-xs text-[#202238] placeholder-[#9BA0B8] focus:border-[#6658E8] focus:bg-white focus:outline-hidden transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 text-[#9BA0B8] hover:text-[#202238]"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
