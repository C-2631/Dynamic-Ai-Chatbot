'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { FileCategory, UploadedAttachment } from '@/types/chat';
import {
  CATEGORY_ACCEPT_ATTRIBUTES,
  validateSelectedFile,
} from '@/lib/file-validation';

interface AttachmentMenuProps {
  onFilesValidated: (attachments: UploadedAttachment[]) => void;
  onError: (errorMsg: string) => void;
  existingAttachmentNames?: string[];
  disabled?: boolean;
}

export default function AttachmentMenu({
  onFilesValidated,
  onError,
  existingAttachmentNames = [],
  disabled = false,
}: AttachmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentCategory, setCurrentCategory] = useState<FileCategory>('document');

  // Dismiss on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTriggerCategoryPicker = (category: FileCategory) => {
    setCurrentCategory(category);
    setIsOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.accept = CATEGORY_ACCEPT_ATTRIBUTES[category];
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validatedList: UploadedAttachment[] = [];
    const currentNames = [...existingAttachmentNames];

    for (const file of files) {
      const result = validateSelectedFile(file, currentNames);
      if (!result.valid) {
        onError(result.error || `File "${file.name}" is not supported.`);
        continue;
      }

      currentNames.push(file.name);

      let previewUrl: string | undefined;
      if (result.category === 'image' || result.category === 'video') {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {
          // Fallback
        }
      }

      const item: UploadedAttachment = {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        size: file.size,
        category: result.category || 'document',
        extension: result.extension || '',
        previewUrl,
        status: 'ready',
      };
      // Attach raw File reference for live upload
      (item as any).rawFile = file;

      validatedList.push(item);
    }

    if (validatedList.length > 0) {
      onFilesValidated(validatedList);
    }
  };

  return (
    <div ref={menuRef} className="relative flex items-center">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Trigger Button with Popover / Gooey Style Spring Physics */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
          isOpen
            ? 'bg-[#E0DAFC] text-[#6658E8]'
            : 'text-[#A0A5BD] hover:text-[#1E2038] hover:bg-[#F4F5FB]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Attach files (Strict allowlist: Documents, Video, Image)"
        aria-expanded={isOpen}
      >
        <Plus className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Floating Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-12 right-0 z-50 flex flex-col gap-1 w-64 rounded-2xl border border-[#E9E9F2] bg-white p-2 shadow-xl"
          >
            <div className="px-3 py-1.5 border-b border-[#ECEEF6]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A5BD]">
                Allowed Attachments
              </span>
            </div>

            {/* Document Option */}
            <button
              type="button"
              onClick={() => handleTriggerCategoryPicker('document')}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left hover:bg-[#F0EDFF] transition-colors cursor-pointer group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] text-[#6658E8] group-hover:bg-[#6658E8] group-hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#202238]">Document</span>
                <span className="text-[10px] text-[#777C94]">.pdf, .doc, .docx, .ppt, .pptx</span>
              </div>
            </button>

            {/* Video Option */}
            <button
              type="button"
              onClick={() => handleTriggerCategoryPicker('video')}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left hover:bg-[#F0EDFF] transition-colors cursor-pointer group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] text-[#6658E8] group-hover:bg-[#6658E8] group-hover:text-white transition-colors">
                <Video className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#202238]">Video</span>
                <span className="text-[10px] text-[#777C94]">.mp4, .avi</span>
              </div>
            </button>

            {/* Image Option */}
            <button
              type="button"
              onClick={() => handleTriggerCategoryPicker('image')}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left hover:bg-[#F0EDFF] transition-colors cursor-pointer group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] text-[#6658E8] group-hover:bg-[#6658E8] group-hover:text-white transition-colors">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#202238]">Image</span>
                <span className="text-[10px] text-[#777C94]">.png, .jpg</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
