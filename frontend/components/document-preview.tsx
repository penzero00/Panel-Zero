/**
 * Document Preview Component
 * Shows simulated processed document with injected highlights
 */

'use client';

import React from 'react';
import { Eye, Download, MessageSquare } from 'lucide-react';

interface DocumentPreviewProps {
  fileName: string;
  onDownload: () => void;
  onReset: () => void;
}

export function DocumentPreview({ fileName, onDownload, onReset }: DocumentPreviewProps) {
  return (
    <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm scroll-mt-24">
      <div className="bg-slate-200/80 backdrop-blur-sm px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
          <Eye size={16} className="text-slate-600" />
          Simulated Preview: {fileName || 'Document.docx'}
        </div>

        <button
          onClick={onDownload}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 text-sm w-full sm:w-auto justify-center"
        >
          <Download size={16} />
          Download _REVIEWED.docx
        </button>
      </div>

      <div className="p-8 font-serif bg-white shadow-inner max-h-96 overflow-y-auto relative">
        <h4 className="text-xl font-bold text-slate-900 mb-4">Chapter 3: Methodology</h4>
        <p className="text-slate-800 leading-relaxed mb-4 text-sm">
          This study utilizes a quantitative research design to determine the effectiveness of the
          system. The data{' '}
          <span className="bg-yellow-200 px-1 rounded cursor-pointer border-b-2 border-yellow-400 group relative">
            will be gathered by the researchers
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-white border border-slate-200 shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none font-sans">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={14} className="text-blue-600" />
                <span className="font-bold text-xs text-slate-800">Language Critic</span>
              </div>
              <p className="text-xs text-slate-600">
                Tense mismatch. Chapter 3 requires past passive voice. Change to: "was gathered".
              </p>
            </div>
          </span>{' '}
          using survey questionnaires distributed to 50 participants. The statistical treatment applied
          is Pearson-r.
        </p>
        <p className="text-slate-800 leading-relaxed text-sm">
          Table 1 shows the demographic profile. The format of the table follows the standard
          guidelines provided by the university.
        </p>
      </div>
    </div>
  );
}
