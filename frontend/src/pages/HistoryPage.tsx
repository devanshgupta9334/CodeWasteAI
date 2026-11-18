import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  FileCode, 
  AlertTriangle, 
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  history: HistoryItem[];
  onSelectRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNavigateToAnalyzer: () => void;
}

export const HistoryPage: React.FC<Props> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onNavigateToAnalyzer
}) => {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const filtered = history.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.language.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLanguage === 'all' || item.language.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesLang;
  });

  const languages = ['all', ...Array.from(new Set(history.map(h => h.language)))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Persistent SQLite Records
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            Analysis Run History
          </h2>
          <p className="text-xs text-slate-400">
            Reopen full reports, view side-by-side diffs, or delete old audit logs
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
                onClearAll();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippet name..."
            className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Language Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all whitespace-nowrap ${
                selectedLanguage === lang
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* History Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#111827] rounded-2xl border border-dashed border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileCode className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Analysis Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {history.length === 0
                ? "You haven't run any code analyses yet. Head over to the Code Analyzer to scan your first file."
                : "No analyses match the current search filter."}
            </p>
          </div>
          {history.length === 0 && (
            <button
              onClick={onNavigateToAnalyzer}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Start Analysis
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Snippet Title</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Quality Score</th>
                  <th className="py-3.5 px-4">Issues Found</th>
                  <th className="py-3.5 px-4">Reduction</th>
                  <th className="py-3.5 px-4">Analysis Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td 
                      onClick={() => onSelectRecord(item.id)}
                      className="py-4 px-5 font-sans font-medium text-slate-200 group-hover:text-indigo-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold uppercase">
                        {item.language}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`font-bold text-sm ${
                        item.code_quality_score >= 80 
                          ? 'text-emerald-400' 
                          : item.code_quality_score >= 60 
                          ? 'text-amber-400' 
                          : 'text-rose-400'
                      }`}>
                        {Math.round(item.code_quality_score)} / 100
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-mono">{item.total_issues}</span>
                        <div className="flex items-center gap-1 text-[10px]">
                          {item.high_severity > 0 && <span className="text-red-400">({item.high_severity}H)</span>}
                          {item.medium_severity > 0 && <span className="text-amber-400">({item.medium_severity}M)</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-emerald-400 font-semibold">
                      -{item.potential_reduction_pct}%
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-4 px-5 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectRecord(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Open full report and diff"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
