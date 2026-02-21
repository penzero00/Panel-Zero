/**
 * Landing Page
 * Public-facing introduction to PanelZero
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';
import { useCurrentUser, useUserProfile } from '@/lib/query-hooks';

export default function LandingPage() {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? null;
  const { data: profile } = useUserProfile(userId);
  const isAuthenticated = !!currentUser;
  const displayName = useMemo(
    () => profile?.full_name || currentUser?.email || 'User',
    [profile, currentUser]
  );
  const avatarUrl = profile?.avatar_url || null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">
      <Header
        isAuthenticated={isAuthenticated}
        activeTab="analysis"
        onTabChange={() => {}}
        userName={displayName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
      />

      <div className="flex flex-col min-h-screen pt-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[100px] rounded-full"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full"></div>
        </div>

        <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 my-20">
          <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-sm font-medium mb-4 backdrop-blur-sm">
              <ShieldAlert size={16} /> Now enforcing strict APA 7th Edition logic
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
              The Final Checkpoint.
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              PanelZero is a role-based, multi-agent AI grading system. We strictly analyze DOCX
              files to preserve formatting, injecting academic feedback surgically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/login"
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300"
              >
                Access Portal <ChevronRight size={20} />
              </Link>
              <button className="bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md">
                View Architecture
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
              {[
                {
                  title: 'Non-Destructive',
                  desc: "We edit the underlying XML. Your tables and floating images are safe.",
                },
                {
                  title: 'Role-Based AI',
                  desc: 'Select specific agents like Statistician or Language Critic to save API tokens.',
                },
                {
                  title: 'Zero Retention',
                  desc: 'Uploaded thesis drafts are wiped from ephemeral storage hourly via RLS.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left hover:-translate-y-1 transition-transform duration-300"
                >
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
