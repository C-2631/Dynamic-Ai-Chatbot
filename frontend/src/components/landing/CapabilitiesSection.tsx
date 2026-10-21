'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Video, Layers, CheckCircle } from 'lucide-react';

export default function CapabilitiesSection() {
  const capabilities = [
    {
      id: 'natural-conversations',
      title: 'Natural Conversations',
      description:
        'Engage in multi-turn dialogues with dynamic intent classification, conversational slot filling, and adaptive tone awareness designed for support resolution.',
      icon: <MessageSquare className="h-6 w-6 text-[#6658E8]" />,
      pill: 'Multi-turn Context',
      bgPill: 'bg-[#F0EDFF] text-[#6658E8]',
      formats: 'Intent reasoning &bull; Slot-filling &bull; Context memory',
    },
    {
      id: 'document-workflows',
      title: 'Document Workflows',
      description:
        'Parse complex legal contracts, financial summaries, and presentations with explicit document citations and zero fabricated claims.',
      icon: <FileText className="h-6 w-6 text-[#15803D]" />,
      pill: 'Documents Ingested',
      bgPill: 'bg-[#E7F7F0] text-[#15803D]',
      formats: 'Strictly: .pdf, .doc, .docx, .ppt, .pptx',
    },
    {
      id: 'visual-video-context',
      title: 'Visual and Video Context',
      description:
        'Pinpoint exact keyframe timestamps across assembly and demo videos, and inspect inspection photos and receipts with OCR text recognition.',
      icon: <Video className="h-6 w-6 text-[#8D7CF5]" />,
      pill: 'Multimodal Media',
      bgPill: 'bg-[#F0EDFF] text-[#8D7CF5]',
      formats: 'Strictly: .mp4, .avi, .png, .jpg',
    },
  ];

  return (
    <section id="capabilities" className="scroll-mt-20 md:scroll-mt-24 border-t border-[#E9E9F2] bg-[#FAFAFC] px-6 py-24 md:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <div className="text-center space-y-4">
          <span className="inline-block rounded-full bg-[#F0EDFF] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#6658E8]">
            Core Architecture
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#202238] sm:text-4xl md:text-5xl">
            Precision Intelligence Across Modalities
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#777C94]">
            Explore the three fundamental capabilities built into the Dynamic AI Chatbot interface.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group flex flex-col justify-between rounded-3xl border border-[#E9E9F2] bg-white p-8 md:p-9 shadow-sm hover:border-[#8D7CF5] hover:shadow-lg transition-all min-h-[340px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] shadow-xs border border-[#E9E9F2] transition-transform group-hover:scale-105">
                    {cap.icon}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cap.bgPill}`}>
                    {cap.pill}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#202238] group-hover:text-[#6658E8] transition-colors pt-2">
                  {cap.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#777C94]">{cap.description}</p>
              </div>

              <div className="mt-8 border-t border-[#E9E9F2] pt-4 text-xs font-mono text-[#777C94]">
                <span dangerouslySetInnerHTML={{ __html: cap.formats }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
