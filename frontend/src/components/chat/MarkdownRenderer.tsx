'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parts = parseMarkdown(content);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-[#1E2038] leading-relaxed max-w-full overflow-hidden">
      {parts.map((part, index) => {
        if (part.type === 'h2') {
          return (
            <h2 key={index} className="text-base sm:text-lg font-bold text-[#171923] pt-2 pb-1 border-b border-[#ECEEF6] tracking-tight">
              {formatInline(part.text)}
            </h2>
          );
        }

        if (part.type === 'h3') {
          return (
            <h3 key={index} className="text-sm sm:text-base font-bold text-[#2A2E45] pt-1.5 pb-0.5 tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6C5CE7]" />
              <span>{formatInline(part.text)}</span>
            </h3>
          );
        }

        if (part.type === 'table') {
          return (
            <div key={index} className="my-3 overflow-x-auto rounded-2xl border border-[#E4E7F4] bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E7F4] bg-[#F7F8FC]">
                    {part.headers?.map((header, hIdx) => (
                      <th key={hIdx} className="py-2.5 px-4 font-bold text-[#1E2038] tracking-wider uppercase text-[10px]">
                        {formatInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3FB]">
                  {part.rows?.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FAFBFD] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-4 text-[#3A405B]">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (part.type === 'code') {
          return (
            <CodeBlock key={index} language={part.language || 'python'} code={part.text} />
          );
        }

        if (part.type === 'list') {
          return (
            <ul key={index} className="space-y-1.5 my-2 pl-2">
              {part.items?.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2.5 text-[#3A405B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7] mt-2 shrink-0" />
                  <span className="flex-1 leading-relaxed">{formatInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (part.type === 'numbered') {
          return (
            <ol key={index} className="space-y-2.5 my-2 pl-1 counter-reset">
              {part.items?.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2.5 text-[#3A405B]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#ECE9FE] text-[10px] font-bold text-[#6C5CE7] mt-0.5">
                    {iIdx + 1}
                  </span>
                  <div className="flex-1 leading-relaxed">{formatInline(item)}</div>
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={index} className="leading-relaxed text-[#2D334A]">
            {formatInline(part.text)}
          </p>
        );
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#E3E6F2] bg-[#FAFBFD] shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#E3E6F2] bg-[#F1F3FB] px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-[#6C5CE7] font-semibold font-mono text-[11px]">
          <Terminal className="h-3.5 w-3.5" />
          <span>{language.toUpperCase()}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D9EC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#4A506E] hover:text-[#1E2038] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-[#15803D]" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-[#1E2038] bg-white selection:bg-[#ECE9FE]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Inline formatting parser: **bold**, `code`, links, math formulas
function formatInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split tokens by bold **text** or inline `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-[#1E2038]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="rounded-md bg-[#F1F3FB] border border-[#E3E6F2] px-1.5 py-0.5 text-[11px] font-mono text-[#6C5CE7]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Parser dividing raw markdown into structured blocks (Headings, Tables, Code, Lists, Paragraphs)
interface BlockPart {
  type: 'h2' | 'h3' | 'table' | 'code' | 'list' | 'numbered' | 'paragraph';
  text: string;
  language?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
}

function parseMarkdown(md: string): BlockPart[] {
  const lines = md.split('\n');
  const blocks: BlockPart[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code Block ```lang
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'python';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: 'code',
        language: lang,
        text: codeLines.join('\n'),
      });
      continue;
    }

    // Markdown Table detection (starts with |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r.split('|').slice(1, -1).map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        // line 1 is separator |---|---|
        const rows = tableLines.slice(2).map(parseRow);

        blocks.push({
          type: 'table',
          text: '',
          headers,
          rows,
        });
        continue;
      }
    }

    // Heading ##
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '') });
      i++;
      continue;
    }

    // Heading ###
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '') });
      i++;
      continue;
    }

    // Unordered List - or *
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', text: '', items });
      continue;
    }

    // Numbered List 1. 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        let currentItem = lines[i].replace(/^\s*\d+\.\s+/, '');
        i++;
        // Collect any indented sub-bullets under this numbered item
        while (i < lines.length && /^\s{2,}[-*]\s+/.test(lines[i])) {
          currentItem += '\n• ' + lines[i].replace(/^\s+[-*]\s+/, '');
          i++;
        }
        items.push(currentItem);
      }
      blocks.push({ type: 'numbered', text: '', items });
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Accumulate standard paragraph
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('```') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      pLines.push(lines[i]);
      i++;
    }

    blocks.push({ type: 'paragraph', text: pLines.join(' ') });
  }

  return blocks;
}
