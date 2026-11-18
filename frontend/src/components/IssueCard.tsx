import React, { useState } from 'react';
import { Issue } from '../types';
import { CategoryBadge, SeverityBadge } from './CategoryBadge';
import { ChevronDown, ChevronUp, Copy, Check, Lightbulb, ArrowRight, Code } from 'lucide-react';

interface Props {
  issue: Issue;
  onNavigateToLine?: (line: number) => void;
}

export const IssueCard: React.FC<Props> = ({ issue, onNavigateToLine }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const copySuggested = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issue.suggested_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all shadow-lg overflow-hidden group">
      {/* Header bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <SeverityBadge severity={issue.severity} />
          <CategoryBadge category={issue.category} />
          <span className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {issue.title}
          </span>
          <span 
            onClick={(e) => {
              if (onNavigateToLine) {
                e.stopPropagation();
                onNavigateToLine(issue.line_number);
              }
            }}
            className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono hover:text-indigo-300 transition-colors"
          >
            Line {issue.line_number}{issue.end_line_number && issue.end_line_number !== issue.line_number ? `–${issue.end_line_number}` : ''}
          </span>
        </div>

        <button className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 pt-3 border-t border-slate-800/80 space-y-4 text-sm">
          {/* Explanation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Why this is an issue
            </h4>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {issue.explanation}
            </p>
          </div>

          {/* Code Snippets: Before & Suggested Fix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Original */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Original Code (Line {issue.line_number})
              </span>
              <pre className="font-mono text-xs bg-[#0b0f19] border border-rose-950/60 p-3 rounded-lg overflow-x-auto text-rose-200">
                <code>{issue.original_code || '// (blank or empty)'}</code>
              </pre>
            </div>

            {/* Suggested */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Recommended Replacement
                </span>
                <button
                  onClick={copySuggested}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Copy fix snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="font-mono text-xs bg-[#0b0f19] border border-emerald-950/60 p-3 rounded-lg overflow-x-auto text-emerald-200">
                <code>{issue.suggested_code}</code>
              </pre>
            </div>
          </div>

          {/* Benefit footer */}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-800">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span><strong className="text-indigo-300">Optimization Benefit:</strong> {issue.optimization_benefit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
