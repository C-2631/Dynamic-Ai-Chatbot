'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Video, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UploadedAttachment } from '@/types/chat';
import { formatBytes } from '@/lib/validation/files';

interface AttachmentTrayProps {
  attachments: UploadedAttachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentTray({ attachments, onRemove }: AttachmentTrayProps) {
  if (attachments.length === 0) return null;

  const renderIcon = (cat: string) => {
    switch (cat) {
      case 'document':
        return <FileText className="h-4 w-4 text-indigo-700" />;
      case 'video':
        return <Video className="h-4 w-4 text-sky-700" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-emerald-700" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="mb-2 flex flex-wrap gap-2 px-1">
      <AnimatePresence>
        {attachments.map((file) => (
          <motion.div
            key={file.id}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-xs"
          >
            {renderIcon(file.category)}
            <div className="flex flex-col text-left max-w-[150px]">
              <span className="truncate font-medium text-slate-800">{file.name}</span>
              <span className="text-[10px] text-slate-400">
                {file.status === 'uploading' ? 'Uploading...' : formatBytes(file.size)}
              </span>
            </div>

            {/* Status Indicator */}
            {file.status === 'uploading' && (
              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
            )}
            {file.status === 'ready' && (
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            )}
            {file.status === 'error' && (
              <span title={file.errorMessage}>
                <AlertCircle className="h-3 w-3 text-red-600" />
              </span>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="text-slate-400 hover:text-red-600 transition-colors ml-1"
              aria-label={`Remove file ${file.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
