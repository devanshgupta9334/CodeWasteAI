import React from 'react';
import { NavigationPage } from '../types';
import { 
  Play, 
  Sparkles, 
  FileCode2, 
  Terminal, 
  ShieldCheck, 
  Activity,
  Layers
} from 'lucide-react';

interface Props {
  currentPage: NavigationPage;
  onQuickAnalyze: () => void;
  analysisCount: number;
}

export const Header: React.FC<Props> = ({ currentPage, onQuickAnalyze, analysisCount }) => {
  const pageTitles: Record<NavigationPage, { title: string; desc: string }> = {
    dashboard: {
      title: 'Platform Overview',
      desc: 'Real-time telemetry, debt reduction ratios, and recent code inspections'
    },
    analyzer: {
      title: 'Code Analyzer & Editor',
      desc: 'AST-powered multi-language static optimization and waste detection'
    },
    results: {
      title: 'Analysis Findings & Audit',
      desc: 'Categorized detections, severity distributions, and code recommendations'
    },
    comparison: {
      title: 'Before & After Differential View',
      desc: 'Side-by-side inspection of original source versus optimized output'
    },
    reports: {
      title: 'Optimization Analytics & Reports',
      desc: 'Visual metrics, quality score breakdowns, and downloadable documentation'
    },
    history: {
      title: 'Persistent Analysis History',
      desc: 'Audit trail of past runs stored locally in SQLite database'
    },
    settings: {
      title: 'Engine Preferences & Rules',
      desc: 'Customize detection passes, language defaults, and analysis thresholds'
    }
  };

  const current = pageTitles[currentPage] || pageTitles.dashboard;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {current.desc}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick run button */}
        <button
          onClick={onQuickAnalyze}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>New Analysis</span>
        </button>

        {/* Global badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Analyses: <strong className="text-white font-mono">{analysisCount}</strong></span>
        </div>
      </div>
    </header>
  );
};
