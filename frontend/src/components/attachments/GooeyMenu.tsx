'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { STRICT_ALLOWED_EXTENSIONS, validateSelectedFile } from '@/lib/validation/files';

interface GooeyMenuProps {
  onFilesValidated: (files: File[]) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export default function GooeyMenu({ onFilesValidated, onError, disabled = false }: GooeyMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validatedList: File[] = [];
    for (const f of files) {
      const res = validateSelectedFile(f);
      if (res.valid) {
        validatedList.push(f);
      } else {
        onError(res.error || `File ${f.name} rejected.`);
      }
    }

    if (validatedList.length > 0) {
      onFilesValidated(validatedList);
      setIsOpen(false);
    }
    e.target.value = '';
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG Gooey Filter Specification */}
      <svg className="absolute hidden" aria-hidden="true">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Strict Accept Inputs */}
      <input
        ref={docInputRef}
        type="file"
        multiple
        className="hidden"
        accept={STRICT_ALLOWED_EXTENSIONS.document.join(',')}
        onChange={handleFileChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        multiple
        className="hidden"
        accept={STRICT_ALLOWED_EXTENSIONS.video.join(',')}
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        accept={STRICT_ALLOWED_EXTENSIONS.image.join(',')}
        onChange={handleFileChange}
      />

      {/* Floating Action Menu Bubbles */}
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-12 left-0 flex flex-col items-center gap-2 z-40"
            >
              {/* Document Option */}
              <motion.button
                type="button"
                initial={{ y: 20, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.04 }}
                onClick={() => docInputRef.current?.click()}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-700 shadow-md border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                title="Upload Document (.pdf, .docx, .doc, .pptx, .ppt)"
                aria-label="Upload Document"
              >
                <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="absolute left-12 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Document (PDF, Word, PPT)
                </span>
              </motion.button>

              {/* Video Option */}
              <motion.button
                type="button"
                initial={{ y: 20, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.08 }}
                onClick={() => videoInputRef.current?.click()}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-700 shadow-md border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                title="Upload Video (.mp4, .avi)"
                aria-label="Upload Video"
              >
                <Video className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="absolute left-12 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Video (MP4, AVI)
                </span>
              </motion.button>

              {/* Image Option */}
              <motion.button
                type="button"
                initial={{ y: 20, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.12 }}
                onClick={() => imageInputRef.current?.click()}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-700 shadow-md border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                title="Upload Image (.png, .jpg)"
                aria-label="Upload Image"
              >
                <ImageIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="absolute left-12 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Image (PNG, JPG)
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Trigger Button */}
        <motion.button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.94 }}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            isOpen
              ? 'bg-slate-200 text-slate-800'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-expanded={isOpen}
          aria-label="Add file attachment"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.18 }}>
            <Plus className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
