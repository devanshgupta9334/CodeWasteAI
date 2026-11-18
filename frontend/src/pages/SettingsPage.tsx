import React, { useState } from 'react';
import { UserSettings } from '../types';
import { 
  Settings, 
  Save, 
  Trash2, 
  Check, 
  Sliders, 
  Code, 
  Cpu, 
  Info, 
  Sparkles,
  Shield,
  Palette
} from 'lucide-react';

interface Props {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => Promise<void>;
  onClearHistory: () => Promise<void>;
}

export const SettingsPage: React.FC<Props> = ({
  settings,
  onSaveSettings,
  onClearHistory
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete all historical analysis records?')) {
      setClearing(true);
      await onClearHistory();
      setClearing(false);
      alert('All analysis history has been successfully cleared.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Engine Configuration
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Platform & Analyzer Settings
          </h2>
          <p className="text-xs text-slate-400">
            Customize static analysis passes, duplicate line thresholds, and UI options
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Analysis Passes & Toggles */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Static Analysis Rules & Detection Modules
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Toggle 1: Unused Variables */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_unused_vars}
                onChange={(e) => setForm({ ...form, detect_unused_vars: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Detect Unused Variables & Parameters</span>
                <span className="text-slate-400 text-[11px]">Flags assigned identifiers and function arguments never loaded in scope.</span>
              </div>
            </label>

            {/* Toggle 2: Unnecessary Imports */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_unused_imports}
                onChange={(e) => setForm({ ...form, detect_unused_imports: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Detect Unnecessary Imports & Headers</span>
                <span className="text-slate-400 text-[11px]">Identifies unused import statements in Python, JS, Java, and C++.</span>
              </div>
            </label>

            {/* Toggle 3: Dead Code */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_dead_code}
                onChange={(e) => setForm({ ...form, detect_dead_code: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Detect Unreachable Dead Code</span>
                <span className="text-slate-400 text-[11px]">Finds code placed after terminating statements (return, throw, break, continue).</span>
              </div>
            </label>

            {/* Toggle 4: Duplicate Code */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_duplicate_code}
                onChange={(e) => setForm({ ...form, detect_duplicate_code: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Detect Duplicate Code Blocks (DRY)</span>
                <span className="text-slate-400 text-[11px]">Scans for repeated blocks of code suitable for functional refactoring.</span>
              </div>
            </label>

            {/* Toggle 5: Code Simplification */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_simplification}
                onChange={(e) => setForm({ ...form, detect_simplification: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Code Simplification Opportunities</span>
                <span className="text-slate-400 text-[11px]">Highlights redundant boolean comparisons (== true), useless passes, and static conditions.</span>
              </div>
            </label>

            {/* Toggle 6: Inefficient Loops */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={form.detect_inefficient_loops}
                onChange={(e) => setForm({ ...form, detect_inefficient_loops: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Inefficient Loops & Performance Flaws</span>
                <span className="text-slate-400 text-[11px]">Catches string concatenation in loops, range(len()) anti-patterns, and std::endl abuse.</span>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Language & Threshold Settings */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Code className="w-4 h-4 text-purple-400" />
            Language & Threshold Defaults
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Default Programming Language
              </label>
              <select
                value={form.default_language}
                onChange={(e) => setForm({ ...form, default_language: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Minimum Duplicate Lines Threshold ({form.min_duplicate_lines} lines)
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={form.min_duplicate_lines}
                onChange={(e) => setForm({ ...form, min_duplicate_lines: parseInt(e.target.value) || 3 })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Minimum consecutive matching statements to flag as duplicate code.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Optional AI Explanations */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Optional AI Integration
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              Optional / Rule-Based Default Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-400">
              The engine operates fully offline with built-in AST rule engines. Adding an optional API key enables extended natural language explanations for complex refactoring suggestions.
            </p>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                AI API Key (Optional)
              </label>
              <input
                type="password"
                value={form.ai_api_key || ''}
                onChange={(e) => setForm({ ...form, ai_api_key: e.target.value })}
                placeholder="sk-... or AIzaSy... (leave blank to use default rule engine)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div className="bg-[#111827] border border-rose-900/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400 border-b border-slate-800 pb-3">
            <Trash2 className="w-4 h-4" />
            Storage & History Management
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-200 block">Clear Analysis History</span>
              <span className="text-slate-400 text-[11px]">
                Permanently purge all SQLite records and metrics. This cannot be undone.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              {clearing ? 'Clearing...' : 'Clear History'}
            </button>
          </div>
        </div>
      </form>

      {/* About Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-white flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-indigo-400" />
          About CodeWaste Detector
        </h4>
        <p className="leading-relaxed">
          CodeWaste Detector is an academic engineering project designed to eliminate software bloat and optimize maintainability. Built with FastAPI, Python Abstract Syntax Trees (AST), rolling-hash duplicate detectors, React, Monaco Editor, and Tailwind CSS.
        </p>
      </div>
    </div>
  );
};
