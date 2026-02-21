/**
 * Agent Profile Selector Component
 * Displays as a compact dropdown menu for profile selection
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  FileText,
  BarChart,
  BookOpen,
  Gavel,
  CheckCircle2,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { AgentRole, AgentProfile } from '@/types/index';

const ROLE_META: Record<AgentRole, { name: string; icon: typeof ShieldAlert; desc: string }> = {
  tech: {
    name: 'Technical Reader',
    icon: ShieldAlert,
    desc: 'Strict format, margins, and font checking. (Pure Python)',
  },
  grammar: {
    name: 'Language Critic',
    icon: FileText,
    desc: 'Tense consistency and syntax. (Gemini 1.5 Flash)',
  },
  stats: {
    name: 'Statistician',
    icon: BarChart,
    desc: 'Data logic and table format verification. (Gemini 1.5 Pro)',
  },
  subject: {
    name: 'Subject Specialist',
    icon: BookOpen,
    desc: 'Content coherence and logic checking. (GPT-4o)',
  },
  chairman: {
    name: 'Chairman',
    icon: Gavel,
    desc: 'Consolidated report synthesis. Requires previous agent runs.',
  },
};

const ROLE_ORDER: AgentRole[] = ['tech', 'grammar', 'stats', 'subject', 'chairman'];

interface AgentRoleSelectorProps {
  selectedProfileId: string | null;
  onProfileSelect: (profile: AgentProfile) => void;
  disabled?: boolean;
  agentProfiles?: AgentProfile[];
}

export function AgentRoleSelector({
  selectedProfileId,
  onProfileSelect,
  disabled = false,
  agentProfiles = [],
}: AgentRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProfile = selectedProfileId
    ? agentProfiles.find((profile) => profile.id === selectedProfileId)
    : undefined;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSelect = (profile: AgentProfile) => {
    onProfileSelect(profile);
    setIsOpen(false);
  };

  return (
    <div className={`bg-white/80 backdrop-blur-xl p-6 rounded-2xl border shadow-sm transition-all duration-300 relative z-50 ${disabled ? 'opacity-50 pointer-events-none' : ''} border-slate-200`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Gavel size={18} />
          </div>
          <div>
            <label className="text-xl font-bold text-slate-800 block">
              Select Agent Profile
            </label>
            <p className="text-sm text-slate-500 mt-0.5">Choose a profile with your preferred settings</p>
          </div>
        </div>
        
        {/* Custom Dropdown */}
        <div className="relative min-w-[320px] z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full flex items-center justify-between gap-3 bg-white border-2 rounded-xl px-4 py-3 font-semibold text-slate-800 transition-all ${
              disabled 
                ? 'cursor-not-allowed bg-slate-50 border-slate-200' 
                : isOpen
                  ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-md'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedProfile ? (
                <>
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    {(() => {
                      const RoleIcon = ROLE_META[selectedProfile.agent_role].icon;
                      return <RoleIcon size={16} />;
                    })()}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold block">{selectedProfile.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {ROLE_META[selectedProfile.agent_role].name}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-slate-500 text-sm">-- Select a profile --</span>
              )}
            </div>
            <ChevronDown 
              className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              size={20} 
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[380px] overflow-y-auto">
                {ROLE_ORDER.map((role) => {
                  const roleProfiles = agentProfiles.filter((profile) => profile.agent_role === role);
                  if (roleProfiles.length === 0) return null;

                  const RoleIcon = ROLE_META[role].icon;

                  return (
                    <div key={role} className="border-b border-slate-100 last:border-b-0">
                      <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50">
                        {ROLE_META[role].name}
                      </div>
                      {roleProfiles.map((profile) => {
                        const isSelected = selectedProfileId === profile.id;
                        return (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => handleProfileSelect(profile)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                                : 'hover:bg-slate-50 border-l-4 border-transparent'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <RoleIcon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{profile.name}</span>
                                {profile.is_default && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <Check size={16} className="text-blue-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {profile.description || ROLE_META[role].desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                {agentProfiles.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No profiles available. Create one in Settings.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Role Details */}
      {selectedProfile && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
              {(() => {
                const RoleIcon = ROLE_META[selectedProfile.agent_role].icon;
                return <RoleIcon size={18} />;
              })()}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">{selectedProfile.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ROLE_META[selectedProfile.agent_role].desc}</p>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-slate-700">
                    <span className="font-semibold text-green-700">Profile:</span> {selectedProfile.name}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  {selectedProfile.font_family} {selectedProfile.font_size}pt • {selectedProfile.preferred_citation_style}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
