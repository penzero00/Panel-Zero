/**
 * Auth Callback Page
 * Handles email verification and creates user profile
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if there's a hash in the URL (from email verification link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();

          if (userError || !user) {
            setStatus('error');
            setMessage('Failed to verify email. Please try again.');
            return;
          }

          // Get fresh session to ensure we have the token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            setStatus('error');
            setMessage('Failed to get session. Please try again.');
            return;
          }

          // Create user profile via backend API
          try {
            const userMetadata = user.user_metadata || {};
            const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/user-profiles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                full_name: userMetadata.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                institution: userMetadata.institution || '',
                role: 'student',
              }),
            });

            if (!profileResponse.ok) {
              console.error('Profile creation error:', await profileResponse.json());
            }
          } catch (profileError) {
            console.error('Error creating profile:', profileError);
            // Continue even if profile creation fails - it can be created later
          }

          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // If no verification params, just redirect to login
          setStatus('error');
          setMessage('Invalid verification link. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleEmailVerification();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        isAuthenticated={false}
        activeTab="analysis"
        onTabChange={() => {}}
        onLogout={() => {}}
      />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-16">
        <div className={`absolute top-[10%] left-[20%] w-[60%] h-[60%] ${
          status === 'success' ? 'bg-green-500/10' : status === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
        } blur-[120px] rounded-full pointer-events-none`}></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className={`${
            status === 'success' 
              ? 'bg-gradient-to-br from-green-600 to-emerald-700' 
              : status === 'error'
              ? 'bg-gradient-to-br from-red-600 to-rose-700'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700'
          } p-8 text-center relative overflow-hidden`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              {status === 'loading' && <Loader2 className="text-white animate-spin" size={32} />}
              {status === 'success' && <CheckCircle2 className="text-white" size={32} />}
              {status === 'error' && <AlertCircle className="text-white" size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Verified'}
              {status === 'error' && 'Verification Failed'}
            </h2>
            <p className="text-white/90 text-sm mt-2">
              {status === 'loading' && 'Please wait...'}
              {status === 'success' && 'Your account is now active'}
              {status === 'error' && 'Something went wrong'}
            </p>
          </div>

          <div className="p-8">
            <div className="text-center space-y-4">
              <p className="text-slate-700">{message}</p>
              
              {status === 'loading' && (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}

              {status === 'error' && (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
