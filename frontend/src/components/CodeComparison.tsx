import React, { useState } from 'react';
import { DiffEditor, Editor } from '@monaco-editor/react';
import { Copy, Download, Check, SplitSquareVertical, Columns, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  originalCode: string;
  optimizedCode: string;
  language: string;
  title?: string;
  onCopySuccess?: () => void;
}

export const CodeComparison: React.FC<Props> = ({
  originalCode,
  optimizedCode,
  language,
  title = "Optimized Snippet",
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('side-by-side');

  // Map language name for Monaco Editor
  const monacoLang = (() => {
    const l = language.toLowerCase();
    if (l === 'c' || l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'js') return 'javascript';
    if (l === 'ts') return 'typescript';
    if (l === 'py') return 'python';
    return l;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCode || originalCode);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    const ext = extensions[language.toLowerCase()] || 'txt';
    const blob = new Blob([optimizedCode || originalCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized_${title.replace(/\s+/g, '_').toLowerCase()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const origLines = (originalCode || '').split('\n').length;
  const optLines = (optimizedCode || '').split('\n').length;
  const lineDelta = origLines - optLines;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Before & After Code Comparison
              {lineDelta > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  -{lineDelta} lines removed
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive side-by-side differential inspection & code refactoring
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'side-by-side'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'diff'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Unified Diff
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Copy optimized code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md flex items-center gap-1.5 transition-all"
            title="Download optimized code file"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-[500px] w-full bg-[#0d111a]">
        {viewMode === 'diff' ? (
          <DiffEditor
            height="100%"
            language={monacoLang}
            original={originalCode}
            modified={optimizedCode || originalCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left Column: Original */}
            <div className="flex flex-col h-full">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  ORIGINAL CODE ({origLines} LOC)
                </span>
                <span className="text-slate-500">Unoptimized Source</span>
              </div>
              <div className="flex-1 min-h-[480px]">
                <Editor
                  height="100%"
                  language={monacoLang}
                  value={originalCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Right Column: Optimized */}
            <div className="flex flex-col h-full">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  OPTIMIZED CODE ({optLines} LOC)
                </span>
                <span className="text-emerald-400/80 font-medium">Safe Transformations Applied</span>
              </div>
              <div className="flex-1 min-h-[480px]">
                <Editor
                  height="100%"
                  language={monacoLang}
                  value={optimizedCode || originalCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
