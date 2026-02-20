/**
 * Agent Profile Manager Component
 * Allows users to create, edit, and manage agent-specific preferences
 * Each agent can have multiple profiles with customizable formatting and checking rules
 */

'use client';

import React, { useState } from 'react';
import {
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AgentProfile, CreateAgentProfileInput, AgentRole } from '@/types/index';

interface AgentProfileManagerProps {
  profiles: AgentProfile[];
  onCreateProfile: (profile: CreateAgentProfileInput) => void;
  onUpdateProfile: (id: string, profile: Partial<CreateAgentProfileInput>) => void;
  onDeleteProfile: (id: string) => void;
  onSetActive: (profileId: string, agentRole: AgentRole) => void;
  isLoading?: boolean;
}

const AGENT_ROLES = [
  { id: 'tech' as AgentRole, name: 'Technical Reader', color: 'blue' },
  { id: 'grammar' as AgentRole, name: 'Language Critic', color: 'green' },
  { id: 'stats' as AgentRole, name: 'Statistician', color: 'purple' },
  { id: 'subject' as AgentRole, name: 'Subject Specialist', color: 'orange' },
  { id: 'chairman' as AgentRole, name: 'Chairman', color: 'red' },
];

export function AgentProfileManager({
  profiles,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onSetActive,
  isLoading = false,
}: AgentProfileManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<CreateAgentProfileInput>({
    agent_role: 'tech',
    name: '',
    description: '',
    font_family: 'Times New Roman',
    font_size: 12,
    font_style: 'normal',
    margin_left_inches: 1.5,
    margin_right_inches: 1.0,
    margin_top_inches: 1.0,
    margin_bottom_inches: 1.0,
    line_spacing: 2.0,
    paragraph_spacing_before: 0,
    paragraph_spacing_after: 0,
    first_line_indent: 0.5,
    paragraph_alignment: 'justify',
    image_format: 'embedded',
    image_min_dpi: 300,
    image_max_width_inches: 6.0,
    check_passive_voice: true,
    check_tense_consistency: true,
    check_subject_verb_agreement: true,
    check_sentence_fragments: true,
    preferred_citation_style: 'APA 7th',
    add_space_after_period: true,
    add_space_after_comma: true,
    check_double_spaces: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateProfile(editingId, formData);
      setEditingId(null);
    } else {
      onCreateProfile(formData);
      setShowCreateForm(false);
    }
    // Reset form
    setFormData({
      agent_role: 'tech',
      name: '',
      description: '',
      font_family: 'Times New Roman',
      font_size: 12,
      font_style: 'normal',
      margin_left_inches: 1.5,
      margin_right_inches: 1.0,
      margin_top_inches: 1.0,
      margin_bottom_inches: 1.0,
      line_spacing: 2.0,
      paragraph_spacing_before: 0,
      paragraph_spacing_after: 0,
      first_line_indent: 0.5,
      paragraph_alignment: 'justify',
      image_format: 'embedded',
      image_min_dpi: 300,
      image_max_width_inches: 6.0,
      check_passive_voice: true,
      check_tense_consistency: true,
      check_subject_verb_agreement: true,
      check_sentence_fragments: true,
      preferred_citation_style: 'APA 7th',
      add_space_after_period: true,
      add_space_after_comma: true,
      check_double_spaces: true,
    });
  };

  const handleEdit = (profile: AgentProfile) => {
    setEditingId(profile.id);
    setFormData({
      agent_role: profile.agent_role,
      name: profile.name,
      description: profile.description,
      font_family: profile.font_family,
      font_size: profile.font_size,
      font_style: profile.font_style,
      margin_left_inches: profile.margin_left_inches,
      margin_right_inches: profile.margin_right_inches,
      margin_top_inches: profile.margin_top_inches,
      margin_bottom_inches: profile.margin_bottom_inches,
      line_spacing: profile.line_spacing,
      paragraph_spacing_before: profile.paragraph_spacing_before,
      paragraph_spacing_after: profile.paragraph_spacing_after,
      first_line_indent: profile.first_line_indent,
      paragraph_alignment: profile.paragraph_alignment,
      image_format: profile.image_format,
      image_min_dpi: profile.image_min_dpi,
      image_max_width_inches: profile.image_max_width_inches,
      check_passive_voice: profile.check_passive_voice,
      check_tense_consistency: profile.check_tense_consistency,
      check_subject_verb_agreement: profile.check_subject_verb_agreement,
      check_sentence_fragments: profile.check_sentence_fragments,
      preferred_citation_style: profile.preferred_citation_style,
      add_space_after_period: profile.add_space_after_period,
      add_space_after_comma: profile.add_space_after_comma,
      check_double_spaces: profile.check_double_spaces,
    });
    setShowCreateForm(true);
  };

  const renderProfileForm = () => (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          {editingId ? 'Edit Agent Profile' : 'Create New Agent Profile'}
        </h3>
        <button
          type="button"
          onClick={() => {
            setShowCreateForm(false);
            setEditingId(null);
          }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Agent Role</label>
          <select
            value={formData.agent_role}
            onChange={(e) => setFormData({ ...formData, agent_role: e.target.value as AgentRole })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            {AGENT_ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., APA 7th Strict"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          rows={2}
          placeholder="Brief description of this profile..."
        />
      </div>

      {/* Font Settings */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('font')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Font Settings
          </h4>
          {expandedSections.font ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.font && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Font Family</label>
              <select
                value={formData.font_family}
                onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Georgia">Georgia</option>
                <option value="Cambria">Cambria</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Font Size (8-72pt)</label>
              <input
                type="number"
                value={formData.font_size}
                onChange={(e) => setFormData({ ...formData, font_size: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="8"
                max="72"
              />
              <p className="text-xs text-slate-500 mt-1">DOCX compatible: 8-72 points</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Font Style</label>
              <select
                value={formData.font_style}
                onChange={(e) => setFormData({ ...formData, font_style: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="bold">Bold</option>
                <option value="bold-italic">Bold Italic</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Margin Settings */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('margins')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Page Margins (inches)
          </h4>
          {expandedSections.margins ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.margins && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Left (0.1-2.5")</label>
              <input
                type="number"
                step="0.1"
                value={formData.margin_left_inches}
                onChange={(e) => setFormData({ ...formData, margin_left_inches: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                max="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Right (0.1-2.5")</label>
              <input
                type="number"
                step="0.1"
                value={formData.margin_right_inches}
                onChange={(e) => setFormData({ ...formData, margin_right_inches: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                max="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Top (0.1-2.5")</label>
              <input
                type="number"
                step="0.1"
                value={formData.margin_top_inches}
                onChange={(e) => setFormData({ ...formData, margin_top_inches: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                max="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Bottom (0.1-2.5")</label>
              <input
                type="number"
                step="0.1"
                value={formData.margin_bottom_inches}
                onChange={(e) => setFormData({ ...formData, margin_bottom_inches: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                max="2.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Paragraph Settings */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('paragraph')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Paragraph & Spacing
          </h4>
          {expandedSections.paragraph ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.paragraph && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Line Spacing</label>
              <select
                value={formData.line_spacing}
                onChange={(e) => setFormData({ ...formData, line_spacing: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1.0">Single (1.0)</option>
                <option value="1.5">1.5 Lines</option>
                <option value="2.0">Double (2.0)</option>
                <option value="2.5">2.5 Lines</option>
                <option value="3.0">Triple (3.0)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Alignment</label>
              <select
                value={formData.paragraph_alignment}
                onChange={(e) => setFormData({ ...formData, paragraph_alignment: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">First Line Indent (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.first_line_indent}
                onChange={(e) => setFormData({ ...formData, first_line_indent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Space Before (pt)</label>
              <input
                type="number"
                value={formData.paragraph_spacing_before}
                onChange={(e) => setFormData({ ...formData, paragraph_spacing_before: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Settings */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('images')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Image Format Rules
          </h4>
          {expandedSections.images ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.images && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Image Format</label>
              <select
                value={formData.image_format}
                onChange={(e) => setFormData({ ...formData, image_format: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="embedded">Embedded</option>
                <option value="inline">Inline</option>
                <option value="floating">Floating</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Min DPI</label>
              <input
                type="number"
                value={formData.image_min_dpi}
                onChange={(e) => setFormData({ ...formData, image_min_dpi: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Max Width (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.image_max_width_inches}
                onChange={(e) => setFormData({ ...formData, image_max_width_inches: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grammar & Language Checks */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('grammar')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Grammar & Language Checks
          </h4>
          {expandedSections.grammar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.grammar && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.check_passive_voice}
                  onChange={(e) => setFormData({ ...formData, check_passive_voice: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Passive Voice</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.check_tense_consistency}
                  onChange={(e) => setFormData({ ...formData, check_tense_consistency: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Tense Consistency</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.check_subject_verb_agreement}
                  onChange={(e) => setFormData({ ...formData, check_subject_verb_agreement: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Subject-Verb Agreement</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.check_sentence_fragments}
                  onChange={(e) => setFormData({ ...formData, check_sentence_fragments: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Sentence Fragments</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Preferred Citation Style</label>
              <select
                value={formData.preferred_citation_style}
                onChange={(e) => setFormData({ ...formData, preferred_citation_style: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="APA 7th">APA 7th Edition</option>
                <option value="IEEE">IEEE</option>
                <option value="Chicago">Chicago Manual of Style</option>
                <option value="MLA">MLA</option>
                <option value="Harvard">Harvard</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Spacing Rules */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('spacing')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Spacing & Punctuation Rules
          </h4>
          {expandedSections.spacing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.spacing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.add_space_after_period}
                onChange={(e) => setFormData({ ...formData, add_space_after_period: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Space After Period</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.add_space_after_comma}
                onChange={(e) => setFormData({ ...formData, add_space_after_comma: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Space After Comma</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.check_double_spaces}
                onChange={(e) => setFormData({ ...formData, check_double_spaces: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Check Double Spaces</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          {editingId ? 'Update Profile' : 'Create Profile'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCreateForm(false);
            setEditingId(null);
          }}
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const groupedProfiles = AGENT_ROLES.reduce((acc, role) => {
    acc[role.id] = profiles.filter((p) => p.agent_role === role.id);
    return acc;
  }, {} as Record<AgentRole, AgentProfile[]>);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Agent Profiles</h2>
          <p className="text-slate-500 mt-2">Customize preferences for each AI agent role.</p>
        </div>
        {!showCreateForm && !editingId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle size={18} /> New Profile
          </button>
        )}
      </header>

      {(showCreateForm || editingId) && renderProfileForm()}

      {!showCreateForm && !editingId && (
        <div className="space-y-8">
          {AGENT_ROLES.map((role) => {
            const roleProfiles = groupedProfiles[role.id] || [];
            const activeProfile = roleProfiles.find((p) => p.is_active);

            return (
              <div key={role.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full bg-${role.color}-500`}></div>
                  <h3 className="text-xl font-bold text-slate-800">{role.name}</h3>
                  <span className="text-sm text-slate-500">({roleProfiles.length} profiles)</span>
                </div>

                {roleProfiles.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-slate-500">No profiles for this agent yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                          profile.is_active
                            ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10'
                            : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{profile.name}</h4>
                            {profile.description && (
                              <p className="text-sm text-slate-500 mt-1">{profile.description}</p>
                            )}
                          </div>
                          {profile.is_active && (
                            <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">
                              Active
                            </span>
                          )}
                          {profile.is_default && (
                            <span className="bg-green-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 mb-4">
                          <div className="flex justify-between">
                            <span>Font:</span>
                            <span className="font-medium">{profile.font_family} {profile.font_size}pt</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margins:</span>
                            <span className="font-medium">
                              L:{profile.margin_left_inches}" R:{profile.margin_right_inches}"
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Line Spacing:</span>
                            <span className="font-medium">{profile.line_spacing}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Citation Style:</span>
                            <span className="font-medium">{profile.preferred_citation_style}</span>
                          </div>
                        </div>

                        {!profile.is_default && (
                          <div className="flex gap-2 pt-3 border-t border-slate-200">
                            {!profile.is_active && (
                              <button
                                onClick={() => onSetActive(profile.id, role.id)}
                                className="flex-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                              >
                                <Check size={14} /> Set Active
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(profile)}
                              className="flex-1 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => onDeleteProfile(profile.id)}
                              className="flex-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
