'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Shield, Zap, Cpu, Flame, Gauge, ChevronDown, Check } from 'lucide-react';
import { ModelOption } from '@/types/chat';

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'minimax/minimax-m3.1-flash:free',
    name: 'MiniMax M3.1 Flash',
    provider: 'openrouter',
    badge: 'Free',
    description: '1M token context, high-speed multimodal reasoning & agentic tasks',
    category: 'openrouter',
    icon: 'sparkles'
  },
  {
    id: 'nvidia/nemotron-3.5-super-vl:free',
    name: 'NVIDIA Nemotron 3.5 Super VL',
    provider: 'openrouter',
    badge: 'Free',
    description: 'Vision-language reasoning, complex logic & document analysis',
    category: 'openrouter',
    icon: 'shield'
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA Nemotron 3.5 Lightning',
    provider: 'openrouter',
    badge: 'Free',
    description: 'Ultra-fast NVIDIA MoE architecture for instantaneous answers',
    category: 'openrouter',
    icon: 'zap'
  },
  {
    id: 'google/gemma-4-26b-a4b:free',
    name: 'Google Gemma 4 26B A4B',
    provider: 'openrouter',
    badge: 'Free',
    description: 'Google open weights 26B model for deep analytical intelligence',
    category: 'openrouter',
    icon: 'cpu'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Groq Llama 3.3 70B',
    provider: 'groq',
    badge: 'Groq LPUs',
    description: 'Meta Llama 3.3 70B powered by Groq LPUs at ~300 tokens/sec',
    category: 'groq',
    icon: 'flame'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Groq Llama 3.1 8B Instant',
    provider: 'groq',
    badge: 'Groq Instant',
    description: 'Sub-100ms ultra-low latency conversational speed',
    category: 'groq',
    icon: 'gauge'
  }
];

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: ModelOption) => void;
  models?: ModelOption[];
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  models = DEFAULT_MODELS,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderIcon = (iconName?: string, className: string = 'h-3.5 w-3.5') => {
    switch (iconName) {
      case 'shield':
        return <Shield className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'gauge':
        return <Gauge className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-[#E4E6F2] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E2038] shadow-2xs hover:border-[#6C5CE7]/40 hover:bg-[#FAF9FF] transition-all cursor-pointer"
        title="Select AI Model"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#ECE9FE] text-[#6C5CE7]">
          {renderIcon(activeModel.icon, 'h-3 w-3')}
        </span>
        <span className="font-semibold text-[#202238] max-w-[130px] sm:max-w-[180px] truncate">
          {activeModel.name}
        </span>
        <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
          activeModel.provider === 'groq'
            ? 'bg-[#FEF3C7] text-[#92400E]'
            : 'bg-[#ECE9FE] text-[#6C5CE7]'
        }`}>
          {activeModel.badge}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#8F95B2] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl border border-[#E4E6F2] bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-[#F0F2F8] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F95B2]">
              Select AI Engine
            </span>
            <span className="text-[10px] text-[#8F95B2]">
              Groq & OpenRouter
            </span>
          </div>

          <div className="mt-1.5 max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {models.map((model) => {
              const isSelected = model.id === activeModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 rounded-xl p-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2EFFE] text-[#6C5CE7]'
                      : 'hover:bg-[#F8F9FD] text-[#202238]'
                  }`}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-[#6C5CE7] text-white' : 'bg-[#F0F2F8] text-[#6C5CE7]'
                  }`}>
                    {renderIcon(model.icon, 'h-3.5 w-3.5')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate text-[#1E2038]">
                        {model.name}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                        model.provider === 'groq'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#ECE9FE] text-[#6C5CE7]'
                      }`}>
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777C94] line-clamp-1 mt-0.5">
                      {model.description}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[#6C5CE7] mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-[#F0F2F8] px-2.5 pt-2 text-[10px] text-[#8F95B2] flex items-center justify-between">
            <span>Keys configured in .env</span>
            <span className="font-semibold text-[#6C5CE7]">Auto-fallback ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
