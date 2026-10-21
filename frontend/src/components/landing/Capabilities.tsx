'use client';

import React from 'react';
import { FileText, Video, Image as ImageIcon, Sparkles, Database, ShieldCheck } from 'lucide-react';

export default function Capabilities() {
  const cards = [
    {
      title: 'Contextual Document Analysis',
      desc: 'Native parsing of PDF contracts, Word documents (.docx, .doc), and presentation decks (.pptx, .ppt) with zero hallucinations and accurate section extraction.',
      icon: <FileText className="h-5 w-5 text-indigo-600" />,
      tag: 'PDF &bull; DOCX &bull; PPTX',
    },
    {
      title: 'Video & Audio Parser',
      desc: 'Upload MP4 and AVI files to extract discussion points, identify timestamps, and transcribe spoken sections using our server-side media gateway.',
      icon: <Video className="h-5 w-5 text-sky-600" />,
      tag: 'MP4 &bull; AVI',
    },
    {
      title: 'Visual Perception',
      desc: 'Verify inspections, read diagrams, and analyze high-resolution PNG and JPG images without fabrication.',
      icon: <ImageIcon className="h-5 w-5 text-emerald-600" />,
      tag: 'PNG &bull; JPG',
    },
    {
      title: 'Contextual Memory & Bandit Learning',
      desc: 'Redis-backed sliding session context with epsilon-greedy bandit reinforcement that ranks the most helpful replies based on real user feedback.',
      icon: <Sparkles className="h-5 w-5 text-amber-600" />,
      tag: 'Adaptive Learning',
    },
  ];

  return (
    <section className="border-t border-slate-200 bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Enterprise Readiness</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Multi-Modal Intelligence Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Grounded responses powered by deterministic rules, FAQs, and LLM generative fallbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F6F7FB]/70 p-6 hover:border-indigo-300 hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs border border-slate-200">
                  {c.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200/60">
                <span className="text-[11px] font-mono text-slate-500" dangerouslySetInnerHTML={{ __html: c.tag }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
