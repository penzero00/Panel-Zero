/**
 * Login Page
 * Supabase authentication interface
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('dr.smith@university.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        isAuthenticated={false}
        activeTab="analysis"
        onTabChange={() => {}}
        onLogout={() => {}}
      />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-16">
        <div className="absolute top-[10%] left-[20%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 relative z-10 shadow-lg shadow-blue-500/30">
              P0
            </div>
            <h2 className="text-2xl font-bold text-white relative z-10">Institution Login</h2>
            <p className="text-slate-400 text-sm mt-2 relative z-10">Secure access for validated panel members</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Academic Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Passphrase</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate via Supabase'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
