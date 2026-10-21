'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, ChevronDown, Zap } from 'lucide-react';
import HeroOrb from './HeroOrb';
import { UserProfile } from '@/types/chat';

interface HeroSectionProps {
  onExploreDemo: () => void;
  onDiscoverCapabilities: () => void;
  user?: UserProfile | null;
}

export default function HeroSection({
  onExploreDemo,
  onDiscoverCapabilities,
  user,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32 lg:px-8">
      {/* Background soft lavender accent radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_-10%,rgba(141,124,245,0.12),rgba(250,250,252,0))]" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Column: Headline and CTAs */}
          <div className="space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#E9E9F2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6658E8] shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#6658E8]" />
              <span>{user ? 'Live AI Mode Enabled' : 'Interactive Prototype & Live AI Ready'}</span>
              <span className="h-1 w-1 rounded-full bg-[#8D7CF5]" />
              <span className="font-normal text-[#777C94]">Dynamic AI Chatbot</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-[#202238] sm:text-5xl md:text-6xl sm:leading-[1.1]"
            >
              Your ideas, meet intelligence.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl text-base leading-relaxed text-[#777C94] sm:text-lg"
            >
              Experience natural multi-turn conversations and verified multimodal workflows. Inspect documents (.pdf, .doc, .docx, .ppt, .pptx), review video (.mp4, .avi) timestamps, and examine imagery with strict file validation and grounded responses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-3"
            >
              <button
                type="button"
                onClick={onExploreDemo}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#6658E8] px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#5546D8] hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {user ? (
                  <>
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>Launch Live AI Chatbot</span>
                  </>
                ) : (
                  <>
                    <span>Explore the Interactive Demo</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onDiscoverCapabilities}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E9E9F2] bg-white px-7 py-3.5 text-sm font-semibold text-[#202238] shadow-xs hover:bg-[#F0EDFF] hover:text-[#6658E8] hover:border-[#8D7CF5] transition-all cursor-pointer"
              >
                <span>Discover Capabilities</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Short restrained trust statement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 pt-4 text-xs text-[#777C94]"
            >
              <ShieldCheck className="h-4 w-4 text-[#15803D]" />
              <span>Verifiable multimodal reasoning &bull; Sign in anytime to activate Live AI</span>
            </motion.div>
          </div>

          {/* Right Column: Abstract 3D Orb visual */}
          <div className="flex items-center justify-center">
            <HeroOrb />
          </div>
        </div>
      </div>
    </section>
  );
}
