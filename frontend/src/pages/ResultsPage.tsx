import React, { useState } from 'react';
import { AnalysisResult, IssueCategory, Issue } from '../types';
import { QualityScoreGauge } from '../components/QualityScoreGauge';
import { IssueCard } from '../components/IssueCard';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  TrendingDown, 
  SplitSquareVertical, 
  Download, 
  Variable, 
  PackageMinus, 
  Skull, 
  Sparkles, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onOpenComparison: () => void;
  onDownloadReport: () => void;
}

export const ResultsPage: React.FC<Props> = ({
  result,
  onOpenComparison,
  onDownloadReport
}) => {
  const [activeTab, setActiveTab] = useState<IssueCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: IssueCategory; label: string; count: number; icon: any }[] = [
    { id: 'all', label: 'All Issues', count: result.issues.length, icon: CheckCircle2 },
    { id: 'unused_variables', label: 'Unused Variables', count: result.unused_vars_count, icon: Variable },
    { id: 'duplicate_code', label: 'Duplicate Code', count: result.duplicate_blocks_count, icon: Copy },
    { id: 'unnecessary_imports', label: 'Unused Imports', count: result.unused_imports_count, icon: PackageMinus },
    { id: 'dead_code', label: 'Dead Code', count: result.issues.filter(i => i.category === 'dead_code').length, icon: Skull },
    { id: 'simplification', label: 'Simplification', count: result.issues.filter(i => i.category === 'simplification').length, icon: Sparkles },
    { id: 'performance', label: 'Performance', count: result.issues.filter(i => i.category === 'performance').length, icon: Zap },
  ];

  const filteredIssues = result.issues.filter((issue) => {
    const matchesTab = activeTab === 'all' || issue.category === activeTab;
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.original_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Summary Header Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Score & Rating */}
        <div className="flex items-center gap-6">
          <QualityScoreGauge score={result.code_quality_score} size={130} />
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Audit Complete &bull; {result.language.toUpperCase()}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {result.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Found <strong className="text-white">{result.total_issues} waste items</strong> across {result.original_loc} lines. Potential code reduction: <strong className="text-emerald-400">{result.potential_reduction_pct}%</strong>.
            </p>
          </div>
        </div>

        {/* Severity Metrics Pill Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-900/80 border border-red-500/20 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
            <span className="text-xs font-semibold text-slate-400 block">High</span>
            <span className="text-lg font-bold text-red-400 font-mono">{result.high_severity}</span>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/20 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
            <span className="text-xs font-semibold text-slate-400 block">Med</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{result.medium_severity}</span>
          </div>
          <div className="bg-slate-900/80 border border-blue-500/20 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
            <span className="text-xs font-semibold text-slate-400 block">Low</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{result.low_severity}</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={onOpenComparison}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <SplitSquareVertical className="w-4 h-4" />
              Compare Before/After
            </button>
            <button
              onClick={onDownloadReport}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download PDF analysis report"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick search input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search detected issues..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#111827] rounded-2xl border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              No Issues Found in this Category
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Either this category is clean or no matching items were detected in the source code.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>
    </div>
  );
};
