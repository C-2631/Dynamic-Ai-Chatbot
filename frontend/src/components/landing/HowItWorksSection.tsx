'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, MessageSquareText, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Select or Attach Context',
      desc: 'Pick an existing sample dialogue or attach your own document (.pdf, .doc, .docx, .ppt, .pptx), video (.mp4, .avi), or image (.png, .jpg) using the strict attachment menu.',
      icon: <UploadCloud className="h-5 w-5 text-[#6658E8]" />,
    },
    {
      num: '02',
      title: 'Prompt & Multi-Turn Inquiry',
      desc: 'Use starter suggestions or compose tailored questions with the smooth-caret message input. Review attached preview chips before submitting.',
      icon: <MessageSquareText className="h-5 w-5 text-[#8D7CF5]" />,
    },
    {
      num: '03',
      title: 'Grounded Illustrative Response',
      desc: 'Examine structured answers with tone indicators, clear citations, and explicit prototype disclaimers ensuring no artificial claims of live AI are made.',
      icon: <CheckCircle2 className="h-5 w-5 text-[#15803D]" />,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 md:scroll-mt-24 border-t border-[#E9E9F2] bg-white px-6 py-24 md:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <div className="text-center space-y-4">
          <span className="inline-block rounded-full bg-[#E7F7F0] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#15803D]">
            Workflow Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#202238] sm:text-4xl md:text-5xl">
            How the Prototype Operates
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#777C94]">
            A transparent walkthrough of the interactive frontend flow from input to grounded response.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((st, i) => (
            <motion.div
              key={st.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-[#E9E9F2] bg-[#FAFAFC] p-8 md:p-9 shadow-sm hover:border-[#8D7CF5] hover:shadow-lg transition-all min-h-[280px]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-[#E9E9F2] transition-transform group-hover:scale-105">
                    {st.icon}
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-[#D5D6E5]">{st.num}</span>
                </div>

                <h3 className="text-lg font-bold text-[#202238] mb-3 group-hover:text-[#6658E8] transition-colors">{st.title}</h3>
                <p className="text-sm leading-relaxed text-[#777C94]">{st.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
