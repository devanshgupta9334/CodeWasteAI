import React from 'react';
import { HistoryItem, AnalysisResult } from '../types';
import { 
  FileCode2, 
  AlertTriangle, 
  Copy, 
  TrendingDown, 
  ArrowRight, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Zap,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface Props {
  history: HistoryItem[];
  onStartAnalysis: () => void;
  onSelectHistory: (id: string) => void;
  activeResult: AnalysisResult | null;
}

export const DashboardPage: React.FC<Props> = ({
  history,
  onStartAnalysis,
  onSelectHistory,
  activeResult
}) => {
  const totalAnalyzed = history.length;
  const totalIssues = history.reduce((sum, h) => sum + h.total_issues, 0);
  const totalDuplicates = history.reduce((sum, h) => sum + h.duplicate_blocks_count, 0);
  const avgReduction = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.potential_reduction_pct, 0) / history.length) 
    : 0;

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.code_quality_score, 0) / history.length)
    : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Static AST Optimization & Code Debt Eradication
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Stop Shipping Code Waste. Clean, Shorten & Accelerate.
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            CodeWaste Detector performs deep syntax tree analysis to find unused variables, dead code branches, redundant conditions, and duplicate blocks across Python, JavaScript, TypeScript, Java, and C++.
          </p>
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={onStartAnalysis}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Quick Start Analysis
            </button>
            <span className="text-xs text-slate-400">
              No cloud AI key required &bull; Pure Rule-Based AST Engine
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Files Analyzed
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalAnalyzed}</span>
            <span className="text-xs text-slate-400">snippets</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Recorded in local SQLite store
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Issues Detected
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{totalIssues}</span>
            <span className="text-xs text-slate-400">flaws</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Unused vars, imports & dead code
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Duplicate Blocks
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">{totalDuplicates}</span>
            <span className="text-xs text-slate-400">repeated ranges</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Refactorable via function extraction
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Code Reduction
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{avgReduction}%</span>
            <span className="text-xs text-slate-400">LOC saved</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Average bloat removed safely
          </p>
        </div>
      </div>

      {/* Analysis History & Recent Activity Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Analysis History
            </h3>
            <p className="text-xs text-slate-400">
              Select any past run to reopen complete findings and comparison diffs
            </p>
          </div>

          <button
            onClick={onStartAnalysis}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            Run New Audit <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            <div className="p-3 rounded-full bg-slate-800 text-slate-400">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No analyses run yet</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Paste or upload your code to identify waste and generate clean optimized files.
              </p>
            </div>
            <button
              onClick={onStartAnalysis}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              Analyze Your First Snippet
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title / Snippet</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Issues</th>
                  <th className="py-3 px-4">LOC Reduction</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.slice(0, 5).map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectHistory(item.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-200 group-hover:text-indigo-300">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold uppercase">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${item.code_quality_score >= 80 ? 'text-emerald-400' : (item.code_quality_score >= 60 ? 'text-amber-400' : 'text-rose-400')}`}>
                        {Math.round(item.code_quality_score)} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.total_issues}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      -{item.potential_reduction_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-semibold text-xs">
                        View Report <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
