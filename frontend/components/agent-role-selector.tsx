/**
 * Agent Role Selector Component
 * Displays available roles with descriptions and model routing info
 * Follows AGENTS.md: Smart LLM Routing
 */

'use client';

import React from 'react';
import {
  ShieldAlert,
  FileText,
  BarChart,
  BookOpen,
  Gavel,
} from 'lucide-react';
import type { AgentRole } from '@/types/index';

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
}

export function AgentRoleSelector({
  selectedRole,
  onRoleSelect,
  disabled = false,
}: AgentRoleSelectorProps) {
  return (
    <section className={`bg-white/80 backdrop-blur-xl p-8 rounded-2xl border transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none' : 'shadow-sm'} border-slate-200`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-blue-100 text-blue-700 shadow-inner">
          2
        </div>
        <h3 className="text-xl font-bold text-slate-800">Assign Agent Role</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENT_ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-md ring-4 ring-blue-500/10'
                  : 'border-slate-100 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                  {role.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed font-medium">{role.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
