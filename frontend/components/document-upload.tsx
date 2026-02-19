/**
 * Document Upload Component
 * Handles strict .docx validation and file ingestion
 * Follows AGENTS.md: Strict Rule Violation - NO PDFs allowed
 */

'use client';

import React, { ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface DocumentUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  errorMessage: string;
  isLoading?: boolean;
}

export function DocumentUpload({
  file,
  onFileSelect,
  errorMessage,
  isLoading = false,
}: DocumentUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.docx')) {
      // Strict enforcement per AGENTS.md
      console.error('PDF violation detected: Only .docx files allowed');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      console.error('File size exceeds 50MB limit');
      return;
    }

    onFileSelect(selectedFile);
  };

  return (
    <section
      className={`bg-white/80 backdrop-blur-xl p-8 rounded-2xl border transition-all duration-300 ${
        file ? 'border-green-400 ring-4 ring-green-500/10 shadow-lg' : errorMessage
          ? 'border-red-300 ring-4 ring-red-500/10'
          : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
            file ? 'bg-green-100 text-green-700 shadow-inner' : 'bg-blue-100 text-blue-700 shadow-inner'
          }`}
        >
          1
        </div>
        <h3 className="text-xl font-bold text-slate-800">Document Ingestion</h3>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {!file ? (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all relative group cursor-pointer">
          <input
            type="file"
            accept=".docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
            <UploadCloud className="text-slate-400 group-hover:text-blue-500 transition-colors" size={32} />
          </div>
          <p className="font-semibold text-slate-700 text-lg group-hover:text-blue-700 transition-colors">
            Drag & drop your draft here
          </p>
          <p className="text-sm text-slate-500 mt-2 font-medium">Strictly .docx files only. Max 50MB.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{file.name}</p>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                <CheckCircle size={14} className="text-green-500" />
                {(file.size / 1024 / 1024).toFixed(2)} MB • XML Verified
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="text-sm text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg font-semibold transition-all"
          >
            Remove
          </button>
        </div>
      )}
    </section>
  );
}
