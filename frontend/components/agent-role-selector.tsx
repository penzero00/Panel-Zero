/**
 * Agent Role Selector Component
 * Displays as a compact dropdown menu for role selection
 * Follows AGENTS.md: Smart LLM Routing
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

const AGENT_ROLES = [
  {
    id: 'tech' as AgentRole,
    name: 'Technical Reader',
    icon: ShieldAlert,
    desc: 'Strict format, margins, and font checking. (Pure Python)',
  },
  {
    id: 'grammar' as AgentRole,
    name: 'Language Critic',
    icon: FileText,
    desc: 'Tense consistency and syntax. (Gemini 1.5 Flash)',
  },
  {
    id: 'stats' as AgentRole,
    name: 'Statistician',
    icon: BarChart,
    desc: 'Data logic and table format verification. (Gemini 1.5 Pro)',
  },
  {
    id: 'subject' as AgentRole,
    name: 'Subject Specialist',
    icon: BookOpen,
    desc: 'Content coherence and logic checking. (GPT-4o)',
  },
  {
    id: 'chairman' as AgentRole,
    name: 'Chairman',
    icon: Gavel,
    desc: 'Consolidated report synthesis. Requires previous agent runs.',
  },
];

interface AgentRoleSelectorProps {
  selectedRole: AgentRole | '';
  onRoleSelect: (role: AgentRole) => void;
  disabled?: boolean;
  agentProfiles?: AgentProfile[];
}

export function AgentRoleSelector({
  selectedRole,
  onRoleSelect,
  disabled = false,
  agentProfiles = [],
}: AgentRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getActiveProfile = (roleId: AgentRole): AgentProfile | undefined => {
    return agentProfiles.find((p) => p.agent_role === roleId && p.is_active);
  };

  const selectedRoleData = AGENT_ROLES.find((r) => r.id === selectedRole);
  const activeProfile = selectedRole ? getActiveProfile(selectedRole as AgentRole) : undefined;

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

  const handleRoleSelect = (role: AgentRole) => {
    onRoleSelect(role);
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
              Select Agent Role
            </label>
            <p className="text-sm text-slate-500 mt-0.5">Choose a panelist role for analysis</p>
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
              {selectedRoleData ? (
                <>
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <selectedRoleData.icon size={16} />
                  </div>
                  <span className="text-sm">{selectedRoleData.name}</span>
                </>
              ) : (
                <span className="text-slate-500 text-sm">-- Select a role --</span>
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
                {AGENT_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
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
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{role.name}</span>
                          {isSelected && (
                            <Check size={16} className="text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{role.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Role Details */}
      {selectedRoleData && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
              <selectedRoleData.icon size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">{selectedRoleData.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedRoleData.desc}</p>
              
              {/* Active Profile Badge */}
              {activeProfile && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-slate-700">
                      <span className="font-semibold text-green-700">Active Profile:</span> {activeProfile.name}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    {activeProfile.font_family} {activeProfile.font_size}pt • {activeProfile.preferred_citation_style}
                  </div>
                </div>
              )}
              
              {!activeProfile && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-amber-600 font-medium">
                    ⚠ No active profile set
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
