/**
 * Header Component - Persistent navigation bar
 * Shows different tabs based on authentication state
 * Follows Next.js best practices with client-side interactivity
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, UploadCloud, FolderOpen, Settings } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  activeTab: 'analysis' | 'documents' | 'rubrics';
  onTabChange: (tab: 'analysis' | 'documents' | 'rubrics') => void;
  userName?: string;
  onLogout: () => void;
}

export function Header({
  isAuthenticated,
  activeTab,
  onTabChange,
  userName = 'User',
  onLogout,
}: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md group-hover:shadow-blue-500/30 transition-all">
            P0
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">PanelZero</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <>
              <button
                onClick={() => onTabChange('analysis')}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud size={18} /> Analysis
              </button>
              <button
                onClick={() => onTabChange('documents')}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'documents'
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FolderOpen size={18} /> My Documents
              </button>
              <button
                onClick={() => onTabChange('rubrics')}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === 'rubrics'
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings size={18} /> Rubric Profiles
              </button>
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">{userName}</span>
              <button
                onClick={onLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
              >
                <LogOut size={16} /> <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
