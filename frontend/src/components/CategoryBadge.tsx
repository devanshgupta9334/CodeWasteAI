import React from 'react';
import { IssueCategory, Severity } from '../types';
import { 
  Variable, 
  Copy, 
  PackageMinus, 
  Skull, 
  Sparkles, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  category: IssueCategory;
  className?: string;
}

export const CategoryBadge: React.FC<Props> = ({ category, className = '' }) => {
  switch (category) {
    case 'unused_variables':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
          <Variable className="w-3.5 h-3.5" />
          Unused Variable
        </span>
      );
    case 'duplicate_code':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 ${className}`}>
          <Copy className="w-3.5 h-3.5" />
          Duplicate Code
        </span>
      );
    case 'unnecessary_imports':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 ${className}`}>
          <PackageMinus className="w-3.5 h-3.5" />
          Unnecessary Import
        </span>
      );
    case 'dead_code':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
          <Skull className="w-3.5 h-3.5" />
          Dead Code
        </span>
      );
    case 'simplification':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${className}`}>
          <Sparkles className="w-3.5 h-3.5" />
          Simplification
        </span>
      );
    case 'performance':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <Zap className="w-3.5 h-3.5" />
          Performance
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          General
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  if (severity === 'High') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
        HIGH
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        MED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
      LOW
    </span>
  );
};
