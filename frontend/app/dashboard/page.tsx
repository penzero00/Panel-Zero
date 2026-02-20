/**
 * Dashboard Page - Main application interface
 * Handles document upload, role selection, and analysis execution
 * Uses TanStack Query for all server communication (MANDATORY)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, PlusCircle, FileText, Download, Eye, Menu } from 'lucide-react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { DocumentUpload } from '@/components/document-upload';
import { AgentRoleSelector } from '@/components/agent-role-selector';
import { ExecutionPipeline } from '@/components/execution-pipeline';
import { DocumentPreview } from '@/components/document-preview';
import { AgentProfileManager } from '@/components/agent-profile-manager';
import { supabase } from '@/lib/supabase';
import { 
  useUploadDocument, 
  useStartAnalysis, 
  useAnalysisStatus,
  useAgentProfiles,
  useCreateAgentProfile,
  useUpdateAgentProfile,
  useDeleteAgentProfile,
  useSetActiveAgentProfile
} from '@/lib/query-hooks';
import type { AgentRole, AgentProfile } from '@/types/index';

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Smith_Thesis_Draft_v3.docx', date: 'Oct 24, 2026', status: 'Reviewed', errors: 12 },
  { id: 2, name: 'Methodology_Chapter_Final.docx', date: 'Oct 20, 2026', status: 'Passed', errors: 0 },
  { id: 3, name: 'Literature_Review_Notes.docx', date: 'Oct 15, 2026', status: 'Rejected', errors: 45 },
];



export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'documents' | 'profiles'>('analysis');
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole | ''>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);

  const uploadMutation = useUploadDocument(token);
  const startAnalysisMutation = useStartAnalysis(token);
  const { data: analysisStatus } = useAnalysisStatus(taskId, token);
  const { data: profilesData, isLoading: profilesLoading } = useAgentProfiles(token);
  const agentProfiles = (profilesData || []) as AgentProfile[];
  const createProfileMutation = useCreateAgentProfile(token);
  const updateProfileMutation = useUpdateAgentProfile(token);
  const deleteProfileMutation = useDeleteAgentProfile(token);
  const setActiveProfileMutation = useSetActiveAgentProfile(token);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setToken(session.access_token);
      }
    };
    checkAuth();
  }, [router]);

  // Simulate progress update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'processing') {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setStatus('complete');
            return 100;
          }
          return p + Math.floor(Math.random() * 12);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileSelect = (newFile: File | null) => {
    setErrorMsg('');
    if (newFile && !newFile.name.endsWith('.docx')) {
      setErrorMsg('Strict Rule Violation: PDFs are dead documents. Upload a .docx file.');
      return;
    }
    setFile(newFile);
    setStatus('idle');
    setProgress(0);
  };

  const handleStartAnalysis = async () => {
    if (!file || !selectedRole) return;
    setStatus('processing');
    setProgress(0);
    // In a real app, this would upload and start the analysis via TanStack Query
  };

  const handleCancelScan = () => {
    setStatus('idle');
    setProgress(0);
    // In a real app, this would cancel the ongoing analysis
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const resetFlow = () => {
    setFile(null);
    setSelectedRole('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    setTaskId(null);
  };

  const scrollToPreview = () => {
    document.getElementById('result-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render Different Tabs
  if (activeTab === 'documents') {
    return (
      <DashboardLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        <div className="space-y-6 animate-in fade-in duration-300">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">My Documents</h2>
            <p className="text-slate-500 mt-2">Previously analyzed thesis drafts and reports.</p>
          </header>
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-5 font-semibold">Document Name</th>
                  <th className="p-5 font-semibold">Upload Date</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DOCUMENTS.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors group">
                    <td className="p-5 flex items-center gap-3 font-medium text-slate-800">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText size={18} />
                      </div>
                      {doc.name}
                    </td>
                    <td className="p-5 text-slate-500 text-sm">{doc.date}</td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          doc.status === 'Passed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : doc.status === 'Reviewed'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 ml-auto">
                        <Download size={14} /> Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (activeTab === 'profiles') {
    return (
      <DashboardLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        <div className="animate-in fade-in duration-300">
          <AgentProfileManager
            profiles={agentProfiles}
            onCreateProfile={(profile) => createProfileMutation.mutate(profile)}
            onUpdateProfile={(id, profile) => updateProfileMutation.mutate({ id, profile })}
            onDeleteProfile={(id) => deleteProfileMutation.mutate(id)}
            onSetActive={(profileId, agentRole) => setActiveProfileMutation.mutate({ profileId, agentRole })}
            isLoading={profilesLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Default: Analysis Tab
  return (
    <DashboardLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      <div className="animate-in fade-in duration-300 pb-12">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">New Defense Analysis</h2>
            <p className="text-slate-500 mt-2">Upload a thesis draft and assign a panelist role for targeted inspection.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Agent Profiles</span>
              <span className="font-semibold text-slate-700">Manage Settings</span>
            </div>
            <button onClick={() => setActiveTab('profiles')} className="text-slate-400 hover:text-blue-600 p-1 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Role Selector - Dropdown Menu */}
            <AgentRoleSelector
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
              disabled={false}
              agentProfiles={agentProfiles}
            />

            {/* Document Upload Section */}
            <DocumentUpload
              file={file}
              onFileSelect={handleFileSelect}
              errorMessage={errorMsg}
              isLoading={uploadMutation.isPending}
            />
          </div>

          <div className="lg:col-span-1">
            {/* Execution Pipeline - Right Sidebar */}
            <ExecutionPipeline
              status={status}
              progress={progress}
              selectedRoleName={selectedRole ? selectedRole.toUpperCase() : 'Agent'}
              majorErrors={2}
              minorErrors={14}
              onViewResult={scrollToPreview}
              onInitiateScan={handleStartAnalysis}
              onCancelScan={handleCancelScan}
              isLoading={uploadMutation.isPending}
              canExecute={!!file && !!selectedRole}
            />
          </div>
        </div>

        {status === 'complete' && (
          <DocumentPreview
            fileName={file?.name || 'Document.docx'}
            onDownload={resetFlow}
            onReset={resetFlow}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Dashboard Layout Wrapper
function DashboardLayout({
  children,
  user,
  activeTab,
  setActiveTab,
  onLogout,
}: {
  children: React.ReactNode;
  user: { email?: string } | null;
  activeTab: 'analysis' | 'documents' | 'profiles';
  setActiveTab: (tab: 'analysis' | 'documents' | 'profiles') => void;
  onLogout: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Header
        isAuthenticated={true}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={user?.email || 'User'}
        onLogout={onLogout}
      />
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 mt-16 relative">
        {/* Floating Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-20 left-6 z-30 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-slate-700" />
        </button>
        {children}
      </div>
    </div>
  );
}
