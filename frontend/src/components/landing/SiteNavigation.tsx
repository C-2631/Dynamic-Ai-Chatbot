'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, User, Zap } from 'lucide-react';
import { UserProfile } from '@/types/chat';

interface SiteNavigationProps {
  onOpenWorkspace: () => void;
  onOpenSignIn: () => void;
  user: UserProfile | null;
  onLogout?: () => void;
}

export default function SiteNavigation({
  onOpenWorkspace,
  onOpenSignIn,
  user,
  onLogout,
}: SiteNavigationProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E9E9F2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo and Name: Dynamic AI */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6658E8] text-white shadow-sm transition-transform group-hover:scale-105">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#202238] tracking-tight">Dynamic AI</span>
            <span className="hidden sm:inline-block rounded-md bg-[#F0EDFF] px-2 py-0.5 text-[11px] font-semibold text-[#6658E8]">
              {user ? 'Live Mode' : 'Prototype'}
            </span>
          </div>
        </Link>

        {/* Functional Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777C94]">
          <a
            href="#capabilities"
            className="hover:text-[#202238] transition-colors cursor-pointer"
          >
            Capabilities
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#202238] transition-colors cursor-pointer"
          >
            How It Works
          </a>
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="hover:text-[#202238] transition-colors cursor-pointer"
          >
            {user ? 'Live Chatbot' : 'Interactive Demo'}
          </button>
        </nav>

        {/* Action Controls: Sign In & Open Live / Demo */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 px-3.5 text-xs text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{user.name}</span>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1 text-[11px] text-[#777C94] hover:text-[#DC2626] cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9F2] bg-white px-4 py-2.5 text-xs font-semibold text-[#202238] shadow-xs hover:bg-[#FAFAFC] transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 text-[#777C94]" />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenWorkspace}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6658E8] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5546D8] hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {user ? (
              <>
                <Zap className="h-4 w-4 text-amber-300" />
                <span>Open Live Chatbot</span>
              </>
            ) : (
              <>
                <span>Open Demo</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
