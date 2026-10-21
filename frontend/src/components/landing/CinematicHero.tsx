'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown, Shield, FileCheck, Layers } from 'lucide-react';
import NeuralCore3D from '../ui/NeuralCore3D';

interface CinematicHeroProps {
  onStartChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export default function CinematicHero({ onStartChat, onSelectPrompt }: CinematicHeroProps) {
  const quickPrompts = [
    'Track my order',
    'Request a refund',
    'What payment methods do you accept?',
    'Summarize this contract document',
  ];

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-10 text-center overflow-hidden">
      {/* Background Soft Studio Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_-15%,rgba(99,102,241,0.12),rgba(246,247,251,0))]" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-7">
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-indigo-800 shadow-xs backdrop-blur-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Next-Generation Contextual AI Assistant</span>
          <span className="h-1 w-1 rounded-full bg-indigo-400" />
          <span className="text-slate-500">FastAPI &bull; Multimodal</span>
        </motion.div>

        {/* 3D Cinematic Core Display */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto h-[290px] w-full max-w-[460px]"
        >
          <NeuralCore3D />
        </motion.div>

        {/* Title & Copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3.5"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Autonomous Multimodal Intelligence
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Instant comprehension for your inquiries, documents, presentations, videos, and images with contextual memory and sentiment-aware responses.
          </p>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium"
        >
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <FileCheck className="h-4 w-4 text-indigo-600" />
            <span>PDF, Word, PPT</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <Layers className="h-4 w-4 text-sky-600" />
            <span>MP4, AVI Video Parser</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>No Hallucinations Guarantee</span>
          </div>
        </motion.div>

        {/* Interactive Starter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-2.5"
        >
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Suggested Questions</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/60 transition-all active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Scroll CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-2"
        >
          <button
            type="button"
            onClick={onStartChat}
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
          >
            <span>Enter Conversation Canvas</span>
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
