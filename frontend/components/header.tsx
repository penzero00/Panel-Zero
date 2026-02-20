/**
 * Header Component - Persistent navigation bar
 * Shows user profile dropdown and logo
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  activeTab: 'analysis' | 'documents' | 'profiles';
  onTabChange: (tab: 'analysis' | 'documents' | 'profiles') => void;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        {/* Logo - Very Left */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md group-hover:shadow-blue-500/30 transition-all">
            P0
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">PanelZero</span>
        </Link>

        {/* Auth Section - Very Right */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <User size={20} />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                  </div>
                  
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={16} /> Account Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}