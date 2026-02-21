/**
 * Agent Profile Manager Component
 * Allows users to create, edit, and manage agent-specific preferences
 * Each agent can have multiple profiles with customizable formatting and checking rules
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
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
  createError?: Error | null;
  updateError?: Error | null;
  deleteError?: Error | null;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
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
  createError = null,
  updateError = null,
  deleteError = null,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
}: AgentProfileManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastMutationTime, setLastMutationTime] = useState<number>(0);

  // Close form when mutations complete successfully
  useEffect(() => {
    if (lastMutationTime === 0) return; // Wait for mutation to be triggered
    
    if (editingId !== null && isUpdating === false) {
      if (updateError) {
        // Show error, keep form open
        setErrorMsg(updateError.message || "Failed to update profile");
      } else {
        // Update completed successfully
        setEditingId(null);
        setShowCreateForm(false);
        resetFormData();
        setSuccessMsg("Profile updated successfully!");
        setLastMutationTime(0);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  }, [isUpdating, updateError, editingId, lastMutationTime]);

  useEffect(() => {
    if (lastMutationTime === 0) return;
    
    if (editingId === null && isCreating === false) {
      if (createError) {
        // Show error, keep form open
        setErrorMsg(createError.message || "Failed to create profile");
      } else {
        // Create completed successfully
        setShowCreateForm(false);
        resetFormData();
        setSuccessMsg("Profile created successfully!");
        setLastMutationTime(0);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  }, [isCreating, createError, editingId, lastMutationTime]);

  useEffect(() => {
    if (isDeletingId === null) return;
    
    if (isDeleting === false) {
      if (deleteError) {
        // Show error
        setErrorMsg(deleteError.message || "Failed to delete profile");
        setIsDeletingId(null);
      } else {
        // Delete completed successfully
        setIsDeletingId(null);
        setSuccessMsg("Profile deleted successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  }, [isDeleting, deleteError, isDeletingId]);
  const [formData, setFormData] = useState<CreateAgentProfileInput>({
    agent_role: 'tech',
    name: '',
    custom_instruction: '',
    font_family: 'Times New Roman',
    font_size: 12,
    font_style: 'normal',
    enable_font_check: true,
    margin_left_inches: 1.5,
    margin_right_inches: 1.0,
    margin_top_inches: 1.0,
    margin_bottom_inches: 1.0,
    enable_margin_check: true,
    line_spacing: 2.0,
    paragraph_spacing_before: 0,
    paragraph_spacing_after: 0,
    first_line_indent: 0.5,
    paragraph_alignment: 'justify',
    enable_paragraph_check: true,
    image_format: 'embedded',
    image_min_dpi: 300,
    image_max_width_inches: 6.0,
    enable_image_check: true,
    check_passive_voice: true,
    check_tense_consistency: true,
    check_subject_verb_agreement: true,
    check_sentence_fragments: true,
    preferred_citation_style: 'APA 7th',
    enable_grammar_check: true,
    add_space_after_period: true,
    add_space_after_comma: true,
    check_double_spaces: true,
    enable_spacing_check: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingId !== null) {
        console.log('Updating profile:', editingId, formData);
        onUpdateProfile(editingId, formData);
      } else {
        console.log('Creating profile:', formData);
        onCreateProfile(formData);
      }
      // Mark that we initiated a mutation
      setLastMutationTime(Date.now());
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const resetFormData = () => {
    setFormData({
      agent_role: 'tech',
      name: '',
      custom_instruction: '',
      font_family: 'Times New Roman',
      font_size: 12,
      font_style: 'normal',
      enable_font_check: true,
      margin_left_inches: 1.5,
      margin_right_inches: 1.0,
      margin_top_inches: 1.0,
      margin_bottom_inches: 1.0,
      enable_margin_check: true,
      line_spacing: 2.0,
      paragraph_spacing_before: 0,
      paragraph_spacing_after: 0,
      first_line_indent: 0.5,
      paragraph_alignment: 'justify',
      enable_paragraph_check: true,
      image_format: 'embedded',
      image_min_dpi: 300,
      image_max_width_inches: 6.0,
      enable_image_check: true,
      check_passive_voice: true,
      check_tense_consistency: true,
      check_subject_verb_agreement: true,
      check_sentence_fragments: true,
      preferred_citation_style: 'APA 7th',
      enable_grammar_check: true,
      add_space_after_period: true,
      add_space_after_comma: true,
      check_double_spaces: true,
      enable_spacing_check: true,
    });
  };

  const handleEdit = (profile: AgentProfile) => {
    console.log('Editing profile:', profile);
    setFormData({
      agent_role: profile.agent_role,
      name: profile.name || '',
      custom_instruction: profile.custom_instruction || '',
      font_family: profile.font_family || 'Times New Roman',
      font_size: profile.font_size ?? 12,
      font_style: profile.font_style || 'normal',
      enable_font_check: profile.enable_font_check ?? true,
      margin_left_inches: profile.margin_left_inches ?? 1.5,
      margin_right_inches: profile.margin_right_inches ?? 1.0,
      margin_top_inches: profile.margin_top_inches ?? 1.0,
      margin_bottom_inches: profile.margin_bottom_inches ?? 1.0,
      enable_margin_check: profile.enable_margin_check ?? true,
      line_spacing: profile.line_spacing ?? 2.0,
      paragraph_spacing_before: profile.paragraph_spacing_before ?? 0,
      paragraph_spacing_after: profile.paragraph_spacing_after ?? 0,
      first_line_indent: profile.first_line_indent ?? 0.5,
      paragraph_alignment: profile.paragraph_alignment || 'justify',
      enable_paragraph_check: profile.enable_paragraph_check ?? true,
      image_format: profile.image_format || 'embedded',
      image_min_dpi: profile.image_min_dpi ?? 300,
      image_max_width_inches: profile.image_max_width_inches ?? 6.0,
      enable_image_check: profile.enable_image_check ?? true,
      check_passive_voice: profile.check_passive_voice ?? true,
      check_tense_consistency: profile.check_tense_consistency ?? true,
      check_subject_verb_agreement: profile.check_subject_verb_agreement ?? true,
      check_sentence_fragments: profile.check_sentence_fragments ?? true,
      preferred_citation_style: profile.preferred_citation_style || 'APA 7th',
      enable_grammar_check: profile.enable_grammar_check ?? true,
      add_space_after_period: profile.add_space_after_period ?? true,
      add_space_after_comma: profile.add_space_after_comma ?? true,
      check_double_spaces: profile.check_double_spaces ?? true,
      enable_spacing_check: profile.enable_spacing_check ?? true,
    });
    setEditingId(profile.id);
    setShowCreateForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLastMutationTime(0); // Reset mutation tracking
  };

  const handleDelete = (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }
    setIsDeletingId(profileId);
    setErrorMsg(null);
    try {
      onDeleteProfile(profileId);
      // Mark that we initiated a mutation
      setLastMutationTime(Date.now());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete profile");
      setIsDeletingId(null);
    }
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
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Custom Instructions
            <span className="text-xs font-normal text-slate-500 ml-2">(Optional - will be included in AI agent prompt)</span>
          </label>
          <textarea
            value={formData.custom_instruction}
            onChange={(e) => setFormData({ ...formData, custom_instruction: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
            placeholder="Add specific instructions for this agent, e.g., 'Focus heavily on statistical significance' or 'Be extra strict with APA formatting'..."
          />
        </div>
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_font_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_font_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable font validation</span>
            </label>
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_margin_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_margin_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable margin validation</span>
            </label>
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_paragraph_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_paragraph_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable paragraph validation</span>
            </label>
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_image_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_image_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable image validation</span>
            </label>
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_grammar_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_grammar_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable grammar checks</span>
            </label>
          </h4>
          {expandedSections.grammar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.grammar && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                checked={formData.check_passive_voice ?? true}
                  onChange={(e) => setFormData({ ...formData, check_passive_voice: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Passive Voice</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                checked={formData.check_tense_consistency ?? true}
                  onChange={(e) => setFormData({ ...formData, check_tense_consistency: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Tense Consistency</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                checked={formData.check_subject_verb_agreement ?? true}
                  onChange={(e) => setFormData({ ...formData, check_subject_verb_agreement: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Check Subject-Verb Agreement</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                checked={formData.check_sentence_fragments ?? true}
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
            <label className="flex items-center gap-2 ml-4 font-normal text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={formData.enable_spacing_check ?? true}
                onChange={(e) => setFormData({ ...formData, enable_spacing_check: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">Enable spacing checks</span>
            </label>
          </h4>
          {expandedSections.spacing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.spacing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.add_space_after_period ?? true}
                onChange={(e) => setFormData({ ...formData, add_space_after_period: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Space After Period</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.add_space_after_comma ?? true}
                onChange={(e) => setFormData({ ...formData, add_space_after_comma: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Space After Comma</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.check_double_spaces ?? true}
                onChange={(e) => setFormData({ ...formData, check_double_spaces: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Check Double Spaces</span>
            </label>
          </div>
        )}
      </div>

      {(errorMsg || updateError || createError || deleteError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            {errorMsg || updateError?.message || createError?.message || deleteError?.message}
          </p>
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={(isUpdating && editingId !== null) || (isCreating && editingId === null) || isLoading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
        >
          {((isUpdating && editingId !== null) || (isCreating && editingId === null)) ? '...' : editingId ? 'Update Profile' : 'Create Profile'}
        </button>
        <button
          type="button"
          disabled={(isUpdating && editingId !== null) || (isCreating && editingId === null) || isLoading}
          onClick={() => {
            setShowCreateForm(false);
            setEditingId(null);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {(deleteError || (successMsg && !showCreateForm)) && (
        <div className={`${successMsg ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <p className={`text-sm ${successMsg ? 'text-green-700' : 'text-red-700'}`}>
            {successMsg || deleteError?.message}
          </p>
        </div>
      )}

      {!showCreateForm && !editingId && (
        <div className="space-y-8">
          {AGENT_ROLES.map((role) => {
            const roleProfiles = groupedProfiles[role.id] || [];

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
                          profile.is_default
                            ? 'border-green-400 bg-green-50/40 shadow-sm'
                            : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{profile.name}</h4>
                            {profile.custom_instruction && (
                              <p className="text-sm text-slate-500 mt-1">{profile.custom_instruction}</p>
                            )}
                          </div>
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
                            <button
                              onClick={() => handleEdit(profile)}
                              className="flex-1 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              disabled={isDeletingId === profile.id}
                              className="flex-1 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 size={14} /> {isDeletingId === profile.id ? '...' : 'Delete'}
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
