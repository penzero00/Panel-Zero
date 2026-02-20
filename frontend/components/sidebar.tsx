/**
 * Sidebar Component - Collapsible navigation sidebar
 * Provides access to main application sections
 */

'use client';

import React from 'react';
import { UploadCloud, FolderOpen, Settings, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'analysis' | 'documents' | 'profiles';
  onTabChange: (tab: 'analysis' | 'documents' | 'profiles') => void;
}

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  const handleTabClick = (tab: 'analysis' | 'documents' | 'profiles') => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Invisible Backdrop for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabClick('analysis')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'analysis'
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud size={20} />
                  <span>Analysis</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabClick('documents')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'documents'
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen size={20} />
                  <span>My Documents</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabClick('profiles')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'profiles'
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Settings size={20} />
                  <span>Agent Profiles</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
