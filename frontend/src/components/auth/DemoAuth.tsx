'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Bot, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types/chat';

interface DemoAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function DemoAuth({ isOpen, onClose, onSuccess }: DemoAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    const liveUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email.trim(),
      provider: 'email',
    };

    onSuccess(liveUser);
    onClose();
  };

  const handleGoogleSimulate = () => {
    const googleUser: UserProfile = {
      id: 'goog_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      provider: 'google',
    };
    onSuccess(googleUser);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl border border-[#E9E9F2] bg-white p-6 sm:p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#777C94] hover:bg-[#FAFAFC] hover:text-[#202238] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#6658E8]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-base font-bold text-[#202238]">
              Sign in to Live AI Chatbot
            </h2>
            <p className="text-xs text-[#777C94]">Unlock the live NLP and multimodal reasoning engine</p>
          </div>
        </div>

        {/* Live Activation Banner */}
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          <p className="text-[11px] leading-relaxed">
            <strong>Live AI Mode:</strong> Signing in transitions you from the demo preview to the active full-stack chatbot with live FastAPI reasoning, intent classification, memory context, and file analysis.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSimulate}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E9E9F2] bg-white p-2.5 text-xs font-semibold text-[#202238] shadow-xs hover:bg-[#FAFAFC] transition-colors mb-4 cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E9E9F2]" />
          </div>
          <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9BA0B8]">
            Or email sign in
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#202238] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#9BA0B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-[#E9E9F2] bg-[#FAFAFC] py-2 pl-9 pr-3 text-xs text-[#202238] placeholder-[#9BA0B8] focus:border-[#6658E8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202238] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#9BA0B8]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-[#E9E9F2] bg-[#FAFAFC] py-2 pl-9 pr-3 text-xs text-[#202238] placeholder-[#9BA0B8] focus:border-[#6658E8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6658E8] p-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#5546D8] transition-all cursor-pointer"
          >
            <span>Sign In & Open Live Chatbot</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
