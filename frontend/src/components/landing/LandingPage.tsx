'use client';

import React from 'react';
import SiteNavigation from './SiteNavigation';
import HeroSection from './HeroSection';
import CapabilitiesSection from './CapabilitiesSection';
import HowItWorksSection from './HowItWorksSection';
import { UserProfile } from '@/types/chat';
import { Bot, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onOpenWorkspace: () => void;
  onOpenSignIn: () => void;
  user: UserProfile | null;
  onLogout?: () => void;
}

export default function LandingPage({
  onOpenWorkspace,
  onOpenSignIn,
  user,
  onLogout,
}: LandingPageProps) {
  const scrollToCapabilities = () => {
    document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#202238] flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <SiteNavigation
          onOpenWorkspace={onOpenWorkspace}
          onOpenSignIn={onOpenSignIn}
          user={user}
          onLogout={onLogout}
        />

        {/* Hero Section */}
        <HeroSection
          onExploreDemo={onOpenWorkspace}
          onDiscoverCapabilities={scrollToCapabilities}
          user={user}
        />

        {/* Capabilities Section */}
        <CapabilitiesSection />

        {/* How It Works Section */}
        <HowItWorksSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E9E9F2] bg-white px-6 py-14 lg:px-8 mt-20">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-xs text-[#777C94]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6658E8] text-white shadow-xs">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#202238]">Dynamic AI Chatbot</span>
              <span className="ml-2.5 rounded-md bg-[#F0EDFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6658E8]">
                {user ? 'Live AI Mode Connected' : 'Interactive Frontend Prototype'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-7 text-xs font-semibold">
            <a href="#capabilities" className="hover:text-[#202238] transition-colors cursor-pointer">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-[#202238] transition-colors cursor-pointer">
              How It Works
            </a>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="hover:text-[#202238] transition-colors cursor-pointer"
            >
              {user ? 'Live AI Chatbot' : 'Interactive Demo Workspace'}
            </button>
          </div>

          <div className="text-[11px] text-[#A0A5BD]">
            &copy; 2026 Dynamic AI Assistant &bull; Full-Stack Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
