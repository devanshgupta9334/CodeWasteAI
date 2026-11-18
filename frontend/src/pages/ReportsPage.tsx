import React from 'react';
import { AnalysisResult } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Download, 
  FileText, 
  FileJson, 
  BarChart3, 
  TrendingDown, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { QualityScoreGauge } from '../components/QualityScoreGauge';

interface Props {
  result: AnalysisResult | null;
  onDownloadReport: (format: 'pdf' | 'markdown' | 'json') => void;
  onNavigateToAnalyzer: () => void;
}

export const ReportsPage: React.FC<Props> = ({
  result,
  onDownloadReport,
  onNavigateToAnalyzer
}) => {
  if (!result) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">No Report Generated Yet</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Run an analysis on your code or select an existing record from the history page to view comprehensive charts and export PDF reports.
        </p>
        <button
          onClick={onNavigateToAnalyzer}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
        >
          Go to Code Analyzer
        </button>
      </div>
    );
  }

  // Data for Category Pie Chart
  const categoryData = [
    { name: 'Unused Vars', value: result.unused_vars_count, color: '#f59e0b' },
    { name: 'Duplicate Code', value: result.duplicate_blocks_count, color: '#a855f7' },
    { name: 'Unused Imports', value: result.unused_imports_count, color: '#3b82f6' },
    { name: 'Dead Code', value: result.issues.filter(i => i.category === 'dead_code').length, color: '#ef4444' },
    { name: 'Simplification', value: result.issues.filter(i => i.category === 'simplification').length, color: '#06b6d4' },
    { name: 'Performance', value: result.issues.filter(i => i.category === 'performance').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Data for Severity Chart
  const severityData = [
    { severity: 'High', count: result.high_severity, fill: '#ef4444' },
    { severity: 'Medium', count: result.medium_severity, fill: '#f59e0b' },
    { severity: 'Low', count: result.low_severity, fill: '#3b82f6' },
  ];

  // Data for LOC Comparison
  const locData = [
    { stage: 'Original LOC', lines: result.original_loc, fill: '#64748b' },
    { stage: 'Optimized LOC', lines: result.optimized_loc, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Export CTAs */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Executive Optimization Report
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {result.title}
          </h2>
          <p className="text-xs text-slate-400">
            Language: <strong className="text-slate-200 uppercase">{result.language}</strong> &bull; Generated on {new Date(result.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onDownloadReport('pdf')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button
            onClick={() => onDownloadReport('markdown')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown
          </button>
          <button
            onClick={() => onDownloadReport('json')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quality Score</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{Math.round(result.code_quality_score)}/100</div>
          <span className="text-[11px] text-emerald-400 font-medium">Standard AST Metric</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Potential Reduction</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">-{result.potential_reduction_pct}%</div>
          <span className="text-[11px] text-slate-400 font-medium">{result.original_loc - result.optimized_loc} lines saved</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Issues Resolved</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1 font-mono">{result.total_issues}</div>
          <span className="text-[11px] text-slate-400 font-medium">Across all categories</span>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">LOC Delta</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{result.original_loc} &rarr; {result.optimized_loc}</div>
          <span className="text-[11px] text-slate-400 font-medium">Original vs Optimized</span>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Breakdown */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Category-Wise Issue Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Relative density of dead code, duplicates, and unused symbols
            </p>
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No issues recorded in this run
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Code Reduction (Original vs Optimized Lines) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Lines of Code (LOC) Reduction
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Before vs After cleanup of dead code, redundant passes and unused imports
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="lines" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations Summary */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Senior Engineering Recommendations
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Automated architectural advice based on detected code smells and AST traversal
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
              1. Modularize Repeated Statements
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Found {result.duplicate_blocks_count} duplicate blocks. Extract these sequences into pure functions to prevent diverging logic and reduce test surface.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
              2. Clean Dead Imports & Declarations
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Eliminating {result.unused_imports_count} unused imports speeds up module loading and avoids bundling unused packages into production builds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
              3. Purge Terminated Branches
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unreachable code after return/throw statements causes reader confusion and skews code coverage metrics. Always prune orphaned statements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
              4. Replace Inefficient Loops
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prefer idiomatic direct iterators and `join()` over quadratic string concatenation (`+=`) in iterative loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
