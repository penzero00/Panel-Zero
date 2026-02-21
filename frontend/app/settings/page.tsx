/**
 * Account Settings Page
 * Allows users to update profile details, email, password, and avatar
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Sidebar } from '@/components/sidebar';
import { supabase } from '@/lib/supabase';
import {
  useCurrentUser,
  useUserProfile,
  useUpdateUserProfile,
  useUpdateAuthEmail,
  useUpdateAuthPassword,
  useUpdateAvatar,
} from '@/lib/query-hooks';
import { Camera, Loader2, Mail, Lock, UserRound, Menu } from 'lucide-react';

const MAX_AVATAR_MB = 5;

export default function SettingsPage() {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const userId = currentUser?.id ?? null;
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);

  const updateProfileMutation = useUpdateUserProfile();
  const updateEmailMutation = useUpdateAuthEmail();
  const updatePasswordMutation = useUpdateAuthPassword();
  const updateAvatarMutation = useUpdateAvatar();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const userEmail = useMemo(() => currentUser?.email || '', [currentUser]);
  const userInitial = useMemo(() => (userEmail ? userEmail[0].toUpperCase() : 'U'), [userEmail]);
  const displayName = useMemo(() => profile?.full_name || userEmail || 'User', [profile, userEmail]);

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    setProfileError('');
    setProfileMessage('');

    try {
      await updateProfileMutation.mutateAsync({
        userId,
        updates: {
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl,
        },
      });
      setProfileMessage('Profile updated successfully.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile.');
    }
  };

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newEmail) {
      setEmailError('Enter a new email address.');
      return;
    }

    setEmailError('');
    setEmailMessage('');

    try {
      await updateEmailMutation.mutateAsync({ email: newEmail.trim() });
      setEmailMessage('Check your inbox to confirm the new email address.');
      setNewEmail('');
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to update email.');
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      setPasswordError('Enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setPasswordError('');
    setPasswordMessage('');

    try {
      await updatePasswordMutation.mutateAsync({ password: newPassword });
      setPasswordMessage('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password.');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setAvatarError('');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please upload a valid image file.');
      return;
    }

    const maxBytes = MAX_AVATAR_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setAvatarError(`Image must be smaller than ${MAX_AVATAR_MB}MB.`);
      return;
    }

    try {
      const updatedProfile = await updateAvatarMutation.mutateAsync({ userId, file });
      setAvatarUrl(updatedProfile.avatar_url || null);
      setProfileMessage('Profile picture updated.');
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Failed to upload avatar.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSidebarTabChange = (tab: 'analysis' | 'documents' | 'profiles') => {
    router.push(`/dashboard?tab=${tab}`);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="analysis"
        onTabChange={handleSidebarTabChange}
      />
      <Header
        isAuthenticated={!!currentUser}
        activeTab="analysis"
        onTabChange={() => {}}
        userName={displayName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
      />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6 relative">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-20 left-6 z-30 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-700" />
          </button>
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-slate-500 mt-2">Manage your profile details and security preferences.</p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin" size={24} />
              <span className="ml-3 text-sm">Loading your settings...</span>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your display name and profile photo.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold">
                          {userInitial}
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1.5 rounded-full cursor-pointer shadow-md">
                        <Camera size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">Profile picture</p>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to {MAX_AVATAR_MB}MB</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative mt-2">
                      <UserRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  {(profileMessage || profileError || avatarError) && (
                    <div className="text-sm">
                      {profileMessage && <p className="text-emerald-600">{profileMessage}</p>}
                      {profileError && <p className="text-red-600">{profileError}</p>}
                      {avatarError && <p className="text-red-600">{avatarError}</p>}
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} /> Saving...
                        </span>
                      ) : (
                        'Save Profile'
                      )}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Email Address</h2>
                <p className="text-sm text-slate-500 mt-1">Update your sign-in email. We will send a confirmation link.</p>

                <form onSubmit={handleEmailUpdate} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Current Email</label>
                    <div className="mt-2 text-slate-600 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      {userEmail || 'Not available'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">New Email</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(event) => setNewEmail(event.target.value)}
                        placeholder="new.email@university.edu"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  {(emailMessage || emailError) && (
                    <div className="text-sm">
                      {emailMessage && <p className="text-emerald-600">{emailMessage}</p>}
                      {emailError && <p className="text-red-600">{emailError}</p>}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-60"
                    disabled={updateEmailMutation.isPending}
                  >
                    {updateEmailMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Updating...
                      </span>
                    ) : (
                      'Update Email'
                    )}
                  </button>
                </form>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Password</h2>
                <p className="text-sm text-slate-500 mt-1">Choose a strong password to keep your account secure.</p>

                <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  {(passwordMessage || passwordError) && (
                    <div className="text-sm">
                      {passwordMessage && <p className="text-emerald-600">{passwordMessage}</p>}
                      {passwordError && <p className="text-red-600">{passwordError}</p>}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Updating...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
