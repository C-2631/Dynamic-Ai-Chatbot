'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Video, Image as ImageIcon, X, Play } from 'lucide-react';
import { UploadedAttachment } from '@/types/chat';
import { formatFileSize } from '@/lib/file-validation';

interface AttachmentPreviewProps {
  attachments: UploadedAttachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl && a.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(a.previewUrl);
        }
      });
    };
  }, [attachments]);

  if (attachments.length === 0) return null;

  const renderIconOrThumb = (att: UploadedAttachment) => {
    if (att.category === 'image' && att.previewUrl) {
      return (
        <img
          src={att.previewUrl}
          alt={att.name}
          className="h-9 w-9 rounded-lg object-cover border border-[#E9E9F2]"
        />
      );
    }

    if (att.category === 'video') {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EDFF] text-[#6658E8] shrink-0 border border-[#E9E9F2]">
          <Play className="h-4 w-4 fill-current ml-0.5" />
        </div>
      );
    }

    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F7F0] text-[#15803D] shrink-0 border border-[#E9E9F2]">
        <FileText className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2 pt-1 border-b border-[#E9E9F2] bg-[#FAFAFC]/60">
      <AnimatePresence>
        {attachments.map((att) => (
          <motion.div
            key={att.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl border border-[#E9E9F2] bg-white p-1.5 pr-2.5 text-xs shadow-xs"
          >
            {renderIconOrThumb(att)}

            <div className="flex flex-col text-left max-w-[150px] sm:max-w-[190px]">
              <span className="truncate font-semibold text-[#202238] text-[11px]" title={att.name}>
                {att.name}
              </span>
              <span className="text-[10px] text-[#777C94]">
                {formatFileSize(att.size)} &bull; {att.extension.toUpperCase().replace('.', '')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="ml-1 rounded-md p-1 text-[#777C94] hover:bg-[#FAFAFC] hover:text-[#DC2626] transition-colors"
              title={`Remove ${att.name}`}
              aria-label={`Remove ${att.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
