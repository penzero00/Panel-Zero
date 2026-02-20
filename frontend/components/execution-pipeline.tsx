/**
 * Execution Pipeline Component
 * Shows task status, progress, and results
 * Integrates with TanStack Query for real-time polling
 */

'use client';

import React from 'react';
import {
  UserCheck,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface ExecutionPipelineProps {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  selectedRoleName?: string;
  majorErrors?: number;
  minorErrors?: number;
  onViewResult: () => void;
  onInitiateScan: () => void;
  onCancelScan?: () => void;
  isLoading?: boolean;
  canExecute: boolean;
}

export function ExecutionPipeline({
  status,
  progress,
  selectedRoleName = 'Agent',
  majorErrors = 0,
  minorErrors = 0,
  onViewResult,
  onInitiateScan,
  onCancelScan,
  isLoading = false,
  canExecute,
}: ExecutionPipelineProps) {
  const getButtonConfig = () => {
    switch (status) {
      case 'processing':
        return {
          text: 'Cancel Scan',
          icon: XCircle,
          onClick: onCancelScan || onInitiateScan,
          disabled: false,
          className: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5 active:scale-95',
        };
      case 'complete':
        return {
          text: 'Re-initiate Scan',
          icon: RotateCcw,
          onClick: onInitiateScan,
          disabled: !canExecute,
          className: canExecute
            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-95'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed',
        };
      default: // idle
        return {
          text: 'Initiate Scan',
          icon: null,
          onClick: onInitiateScan,
          disabled: !canExecute || isLoading,
          className: !canExecute || isLoading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-95',
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 transition-all sticky top-24">
      <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-3 text-slate-800 flex items-center gap-2">
        <Settings size={18} className="text-slate-400" /> Execution Pipeline
      </h3>

      {status === 'idle' && (
        <div className="text-center py-10 animate-in fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Awaiting file and role assignment.</p>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-8 animate-in fade-in">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-bold text-blue-700 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              {selectedRoleName}
            </span>
            <span className="text-slate-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-5 text-center font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
            Executing surgical XML injection safely.
            <br />
            Please wait.
          </p>
        </div>
      )}

      {status === 'complete' && (
        <div className="py-4 space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-gradient-to-b from-green-50 to-white border border-green-200 p-5 rounded-xl text-center shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <p className="font-bold text-green-900 text-lg">Analysis Complete</p>
            <p className="text-xs text-green-600 mt-1 font-medium">Surgical injection successful.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
            <p className="font-bold text-slate-800 mb-3">Findings Summary:</p>
            <ul className="space-y-2">
              <li className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <AlertTriangle className="text-red-500" size={16} /> Major Errors
                </div>
                <span className="bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded text-xs">
                  {majorErrors}
                </span>
              </li>
              <li className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <AlertTriangle className="text-yellow-500" size={16} /> Minor Errors
                </div>
                <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded text-xs">
                  {minorErrors}
                </span>
              </li>
            </ul>
          </div>

          <button
            onClick={onViewResult}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            <Eye size={18} />
            View Result
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100">
        <button
          onClick={buttonConfig.onClick}
          disabled={buttonConfig.disabled}
          className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${buttonConfig.className}`}
        >
          {ButtonIcon && <ButtonIcon size={18} />}
          {buttonConfig.text}
        </button>
      </div>
    </div>
  );
}
