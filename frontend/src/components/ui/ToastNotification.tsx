'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({
  toasts,
  onDismiss,
}: ToastNotificationProps) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="h-4 w-4 text-[#6658E8]" />;
          let border = 'border-[#E9E9F2]';
          let bg = 'bg-white';

          if (toast.type === 'error') {
            icon = <AlertCircle className="h-4 w-4 text-[#DC2626]" />;
            border = 'border-red-200';
            bg = 'bg-red-50/90';
          } else if (toast.type === 'success') {
            icon = <CheckCircle2 className="h-4 w-4 text-[#15803D]" />;
            border = 'border-emerald-200';
            bg = 'bg-emerald-50/90';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg ${bg} ${border}`}
            >
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-xs text-[#202238]">
                {toast.title && <div className="font-bold mb-0.5">{toast.title}</div>}
                <div className="leading-relaxed text-[#777C94]">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-lg p-1 text-[#9BA0B8] hover:text-[#202238] transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
