/**
 * Accurate DOCX Document Preview Component
 * Preserves exact formatting, fonts, margins, and document structure
 * Shows analysis highlights with proper document layout
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Eye, Download, MessageSquare, FileText, ZoomIn, ZoomOut } from 'lucide-react';

interface AnalysisIssue {
  type?: string;
  location?: {
    paragraph?: number;
    text?: string;
  };
  issue?: string;
  suggestion?: string;
  agent?: string;
  severity?: 'major' | 'minor';
  text?: string;
}

interface DocumentStructure {
  paragraphs?: Array<{
    index: number;
    text: string;
    style: string;
  }>;
  estimated_pages?: number;
  total_paragraphs?: number;
}

interface AnalysisResults {
  all_issues?: AnalysisIssue[];
  major_errors?: number;
  minor_errors?: number;
  document_structure?: DocumentStructure;
  injection_summary?: {
    highlights_applied?: number;
    total_issues?: number;
  };
  [key: string]: any;
}

interface DocumentPreviewAccurateProps {
  fileName: string;
  onDownload: () => void;
  onReset: () => void;
  isEmpty?: boolean;
  analysisResults?: AnalysisResults | null;
  fileBlob?: Blob | null;
}

export function DocumentPreviewAccurate({
  fileName,
  onDownload,
  onReset,
  isEmpty = false,
  analysisResults,
  fileBlob,
}: DocumentPreviewAccurateProps) {
  const [docElement, setDocElement] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<'all' | 'major' | 'minor'>('all');
  const [issueQuery, setIssueQuery] = useState('');
  const [highlightedCount, setHighlightedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rawHtmlRef = useRef<string>('');

  const issues = (analysisResults?.all_issues || []) as AnalysisIssue[];
  const majorErrors = analysisResults?.major_errors || 0;
  const minorErrors = analysisResults?.minor_errors || 0;
  const injectionSummary = analysisResults?.injection_summary;
  const documentStructure = analysisResults?.document_structure;

  const indexedIssues = useMemo(() => issues.map((issue, index) => ({ issue, index })), [issues]);

  const filteredIssues = useMemo(() => {
    const query = issueQuery.trim().toLowerCase();
    return indexedIssues.filter(({ issue }) => {
      const severity = issue.severity || 'minor';
      if (issueFilter !== 'all' && severity !== issueFilter) return false;
      if (!query) return true;
      const haystack = [
        issue.issue,
        issue.suggestion,
        issue.location?.text,
        issue.text,
        issue.type,
        issue.agent,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [indexedIssues, issueFilter, issueQuery]);

  // Load and render DOCX file with accurate formatting
  useEffect(() => {
    if (!fileBlob || isEmpty) {
      setIsLoading(false);
      return;
    }

    const loadDocx = async () => {
      try {
        setIsLoading(true);
        
        // Use mammoths advanced HTML conversion with proper style preservation
        const mammoth: any = await import('mammoth');
        
        const arrayBuffer = await fileBlob.arrayBuffer();
        const result = await mammoth.convertToHtml({ 
          arrayBuffer,
          styleMap: [
            // Preserve font styling
            "p[style-name='Normal'] => p:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
          ]
        });

        if (containerRef.current) {
          rawHtmlRef.current = result.value;
          containerRef.current.innerHTML = rawHtmlRef.current;
          
          // Apply document-level styling for accurate representation
          const style = document.createElement('style');
          style.id = 'doc-preview-style';
          style.textContent = `
            #doc-preview-container {
              background: white;
              padding: 40px;
              max-width: 8.5in;
              margin: 0 auto;
              font-family: 'Aptos', 'Calibri', 'Arial', sans-serif;
              line-height: 1.15;
              color: #000;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            #doc-preview-container p {
              margin: 0 0 0.5em 0;
              text-align: justify;
              orphans: 2;
              widows: 2;
            }
            
            #doc-preview-container h1, 
            #doc-preview-container h2, 
            #doc-preview-container h3 {
              font-weight: bold;
              margin: 12pt 0 6pt 0;
            }
            
            #doc-preview-container table {
              border-collapse: collapse;
              width: 100%;
              margin: 6pt 0;
            }
            
            #doc-preview-container table td,
            #doc-preview-container table th {
              border: 1px solid #999;
              padding: 4pt 6pt;
            }
            
            #doc-preview-container .highlight-major {
              background-color: rgb(254, 226, 226);
              border-bottom: 2px solid rgb(220, 38, 38);
              padding: 2px 0;
              border-radius: 2px;
              cursor: pointer;
            }
            
            #doc-preview-container .highlight-minor {
              background-color: rgb(254, 252, 232);
              border-bottom: 2px solid rgb(202, 138, 4);
              padding: 2px 0;
              border-radius: 2px;
              cursor: pointer;
            }
          `;
          const existingStyle = document.getElementById('doc-preview-style');
          if (existingStyle) {
            existingStyle.replaceWith(style);
          } else {
            document.head.appendChild(style);
          }
          
          // Apply highlights to all text nodes
          setHighlightedCount(applyHighlights(containerRef.current, issues));
          setDocElement(containerRef.current);
        }
      } catch (error) {
        console.error('Error loading DOCX:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p style="color: red; text-align: center;">Error loading document. This file may be corrupted or not a valid DOCX file.</p>';
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDocx();
  }, [fileBlob, isEmpty]);

  useEffect(() => {
    if (!containerRef.current || !rawHtmlRef.current) return;
    containerRef.current.innerHTML = rawHtmlRef.current;
    setHighlightedCount(applyHighlights(containerRef.current, issues));
  }, [issues]);

  // Apply highlights to matching text nodes
  const applyHighlights = (container: HTMLDivElement, issuesToHighlight: AnalysisIssue[]) => {
    let applied = 0;
    const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const getTextNodes = () => {
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          nodes.push(node as Text);
        }
        node = walker.nextNode();
      }
      return nodes;
    };

    issuesToHighlight.forEach((issue, idx) => {
      const textToFind = issue.location?.text || issue.text || '';
      if (!textToFind || textToFind.length < 2) return;

      const regex = new RegExp(escapeRegExp(textToFind), 'gi');
      const issueId = `issue-${idx}`;
      const severity = issue.severity || 'minor';
      const bgColor = severity === 'major' ? 'rgb(254, 226, 226)' : 'rgb(254, 252, 232)';
      const borderColor = severity === 'major' ? 'rgb(220, 38, 38)' : 'rgb(202, 138, 4)';

      getTextNodes().forEach((textNode) => {
        const text = textNode.nodeValue;
        if (!text) return;
        regex.lastIndex = 0;
        if (!regex.test(text)) return;
        regex.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        text.replace(regex, (match, offset) => {
          if (offset > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
          }

          const span = document.createElement('span');
          span.style.backgroundColor = bgColor;
          span.style.borderBottom = `2px solid ${borderColor}`;
          span.style.cursor = 'pointer';
          span.style.padding = '2px 0';
          span.style.borderRadius = '2px';
          span.dataset.issueId = issueId;
          span.dataset.issueSeverity = severity;
          span.dataset.issueText = textToFind;
          span.textContent = match;

          span.onclick = (e) => {
            e.stopPropagation();
            setHoveredIssueId((current) => (current === issueId ? null : issueId));
          };
          span.onmouseenter = () => setHoveredIssueId(issueId);
          span.onmouseleave = () => setHoveredIssueId(null);

          fragment.appendChild(span);
          lastIndex = offset + match.length;
          applied += 1;
          return match;
        });

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.replaceWith(fragment);
      });
    });

    return applied;
  };

  const handleIssueJump = (issueId: string) => {
    if (!containerRef.current) return;
    const target = containerRef.current.querySelector(`[data-issue-id="${issueId}"]`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHoveredIssueId(issueId);
    }
  };

  const getAgentLabel = (agent?: string) => {
    const agentMap: Record<string, string> = {
      grammar_critic: 'Language Critic',
      technical_reader: 'Technical Reader',
      statistics: 'Statistician',
      subject_matter: 'Subject Specialist',
      chairman: 'Chairman',
      grammar: 'Language Critic',
      tech: 'Technical Reader',
      stats: 'Statistician',
      subject: 'Subject Specialist',
    };
    return agentMap[agent || 'grammar'] || 'Reviewer';
  };

  const getAgentColor = (agent?: string) => {
    const colorMap: Record<string, string> = {
      grammar_critic: 'text-blue-600',
      technical_reader: 'text-purple-600',
      statistics: 'text-orange-600',
      subject_matter: 'text-green-600',
      chairman: 'text-red-600',
      grammar: 'text-blue-600',
      tech: 'text-purple-600',
      stats: 'text-orange-600',
      subject: 'text-green-600',
    };
    return colorMap[agent || 'grammar'] || 'text-slate-600';
  };

  return (
    <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 backdrop-blur-sm px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-800 font-bold mb-1">
            <Eye size={16} className="text-slate-600" />
            Analysis Results: {fileName || 'Document.docx'}
          </div>
          {!isEmpty && documentStructure && (
            <div className="flex items-center gap-6 text-xs text-slate-600 flex-wrap">
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {documentStructure.estimated_pages || 'Multiple'} pages
              </span>
              <span>{documentStructure.total_paragraphs || 0} paragraphs</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-300 rounded border border-red-500"></span>
                {majorErrors} major
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-300 rounded border border-yellow-400"></span>
                {minorErrors} minor
              </span>
              <span className="text-green-600 font-semibold">
                ✓ {highlightedCount}/{issues.length} highlighted in preview
              </span>
              {injectionSummary && (
                <span className="text-slate-500">
                  (Injected: {injectionSummary.highlights_applied}/{injectionSummary.total_issues})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setZoom(Math.max(zoom - 10, 50))}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-slate-600 font-semibold w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(zoom + 10, 200))}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <button
          onClick={onDownload}
          disabled={isEmpty}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 text-sm w-full sm:w-auto justify-center ${
            isEmpty ? 'opacity-60 cursor-not-allowed hover:shadow-none hover:-translate-y-0' : ''
          }`}
        >
          <Download size={18} />
          Download_REVIEWED.docx
        </button>
      </div>

      {/* Document Container */}
      <div className="bg-slate-100" style={{ maxHeight: '700px' }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 p-6 w-full">
            <FileText size={48} className="mb-4 opacity-50" />
            <p>Upload and analyze a document to see results</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 p-6 w-full">
            <div className="animate-spin">
              <FileText size={48} className="opacity-50" />
            </div>
            <p className="mt-4">Loading document with formatting preservation...</p>
          </div>
        ) : (
          <div className="flex gap-4 p-4 h-full">
            <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <div
                ref={containerRef}
                id="doc-preview-container"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                }}
                className="bg-white p-8"
              />
            </div>

            <div className="w-80 shrink-0 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <div className="text-sm font-bold text-slate-800">Issues</div>
                <div className="text-xs text-slate-500">{filteredIssues.length} shown / {issues.length} total</div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIssueFilter('all')}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      issueFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setIssueFilter('major')}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      issueFilter === 'major'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Major
                  </button>
                  <button
                    onClick={() => setIssueFilter('minor')}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      issueFilter === 'minor'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Minor
                  </button>
                </div>

                <input
                  value={issueQuery}
                  onChange={(event) => setIssueQuery(event.target.value)}
                  placeholder="Search issues"
                  className="w-full text-xs rounded border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="px-4 pb-4 space-y-3">
                {filteredIssues.length === 0 && (
                  <div className="text-xs text-slate-500">No issues match your filter.</div>
                )}
                {filteredIssues.map(({ issue, index }) => {
                  const issueId = `issue-${index}`;
                  const severity = issue.severity || 'minor';
                  return (
                    <button
                      key={`${issueId}`}
                      onClick={() => handleIssueJump(issueId)}
                      className="w-full text-left border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {getAgentLabel(issue.agent)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            severity === 'major'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {severity === 'major' ? 'Major' : 'Minor'}
                        </span>
                      </div>
                      {issue.location?.text && (
                        <div className="text-[11px] text-slate-600 line-clamp-2">"{issue.location.text}"</div>
                      )}
                      {issue.issue && (
                        <div className="text-xs text-slate-800 mt-2 line-clamp-2">{issue.issue}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issue Tooltip */}
      {hoveredIssueId && docElement && (
        <div className="fixed max-w-md p-4 bg-white border-2 border-slate-300 rounded-lg shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          {issues
            .filter((_, idx) => `issue-${idx}` === hoveredIssueId)
            .map((issue, key) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className={getAgentColor(issue.agent)} />
                  <span className="font-bold text-xs text-slate-800">
                    {getAgentLabel(issue.agent)}
                  </span>
                  {issue.severity && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        issue.severity === 'major'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {issue.severity === 'major' ? 'Major' : 'Minor'}
                    </span>
                  )}
                </div>
                {issue.issue && (
                  <div className="text-xs text-slate-700 mb-2">
                    <strong>Issue:</strong> {issue.issue}
                  </div>
                )}
                {issue.suggestion && (
                  <div className="text-xs text-slate-600">
                    <strong>Suggestion:</strong> {issue.suggestion}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Summary */}
      {!isEmpty && issues.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-100/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              <strong>Issues Found:</strong> {issues.length} total ({majorErrors} major, {minorErrors} minor)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
