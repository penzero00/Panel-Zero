/**
 * Dashboard Page - Main application interface
 * Handles document upload, role selection, and analysis execution
 * Uses TanStack Query for all server communication (MANDATORY)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, PlusCircle, FileText, Download, Eye } from 'lucide-react';
import { Header } from '@/components/header';
import { DocumentUpload } from '@/components/document-upload';
import { AgentRoleSelector } from '@/components/agent-role-selector';
import { ExecutionPipeline } from '@/components/execution-pipeline';
import { DocumentPreview } from '@/components/document-preview';
import { supabase } from '@/lib/supabase';
import { useUploadDocument, useStartAnalysis, useAnalysisStatus } from '@/lib/query-hooks';
import type { AgentRole } from '@/types/index';

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Smith_Thesis_Draft_v3.docx', date: 'Oct 24, 2026', status: 'Reviewed', errors: 12 },
  { id: 2, name: 'Methodology_Chapter_Final.docx', date: 'Oct 20, 2026', status: 'Passed', errors: 0 },
  { id: 3, name: 'Literature_Review_Notes.docx', date: 'Oct 15, 2026', status: 'Rejected', errors: 45 },
];

const MOCK_RUBRICS = [
  { id: 1, name: 'APA 7th Edition (Strict)', desc: 'Standard margins, Times New Roman, stringent citation checks.', active: true },
  { id: 2, name: 'IEEE Engineering Standard', desc: 'Two-column format checking, strict figure numbering.', active: false },
  { id: 3, name: 'Chicago Manual of Style', desc: 'Footnote verification and bibliography formatting.', active: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'documents' | 'rubrics'>('analysis');
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole | ''>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);

  const uploadMutation = useUploadDocument(user?.email || null);
  const startAnalysisMutation = useStartAnalysis(user?.email || null);
  const { data: analysisStatus } = useAnalysisStatus(taskId, user?.email || null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
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

  if (activeTab === 'rubrics') {
    return (
      <DashboardLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        <div className="space-y-6 animate-in fade-in duration-300">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Rubric Profiles</h2>
              <p className="text-slate-500 mt-2">Manage formatting rules for the Technical Reader agent.</p>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <PlusCircle size={18} /> New Profile
            </button>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_RUBRICS.map((rubric) => (
              <div
                key={rubric.id}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  rubric.active
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10'
                    : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-lg">{rubric.name}</h3>
                  {rubric.active && (
                    <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{rubric.desc}</p>
                <button
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    rubric.active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800 transition-colors'
                  }`}
                >
                  {rubric.active ? (
                    <>
                      <Settings size={14} /> Edit Rules
                    </>
                  ) : (
                    'Set as Active'
                  )}
                </button>
              </div>
            ))}
          </div>
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
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Rubric</span>
              <span className="font-semibold text-slate-700">APA 7th Edition</span>
            </div>
            <button onClick={() => setActiveTab('rubrics')} className="text-slate-400 hover:text-blue-600 p-1 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DocumentUpload
              file={file}
              onFileSelect={handleFileSelect}
              errorMessage={errorMsg}
              isLoading={uploadMutation.isPending}
            />

            <AgentRoleSelector
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
              disabled={!file}
            />
          </div>

          <div className="lg:col-span-1">
            <ExecutionPipeline
              status={status}
              progress={progress}
              selectedRoleName={selectedRole ? selectedRole.toUpperCase() : 'Agent'}
              majorErrors={2}
              minorErrors={14}
              onViewResult={scrollToPreview}
              onInitiateScan={handleStartAnalysis}
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
  activeTab: 'analysis' | 'documents' | 'rubrics';
  setActiveTab: (tab: 'analysis' | 'documents' | 'rubrics') => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        isAuthenticated={true}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={user?.email || 'User'}
        onLogout={onLogout}
      />
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 mt-16 relative">
        {children}
      </div>
    </div>
  );
}
