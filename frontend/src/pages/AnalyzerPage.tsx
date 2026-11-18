import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { SAMPLES } from '../utils/samples';
import { 
  Play, 
  Trash2, 
  Upload, 
  Sparkles, 
  FileCode, 
  AlertCircle, 
  Loader2, 
  Check, 
  RefreshCw 
} from 'lucide-react';

interface Props {
  onAnalyze: (code: string, language: string, filename?: string) => Promise<void>;
  loading: boolean;
  defaultLanguage?: string;
}

export const AnalyzerPage: React.FC<Props> = ({
  onAnalyze,
  loading,
  defaultLanguage = 'python'
}) => {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const [code, setCode] = useState<string>(SAMPLES[defaultLanguage]?.code || SAMPLES.python.code);
  const [filename, setFilename] = useState<string>('sample_script.py');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setErrorMessage(null);
    if (SAMPLES[newLang]) {
      setCode(SAMPLES[newLang].code);
      const extMap: Record<string, string> = {
        python: 'py',
        javascript: 'js',
        typescript: 'ts',
        java: 'java',
        cpp: 'cpp',
        c: 'c'
      };
      setFilename(`snippet.${extMap[newLang] || 'txt'}`);
    }
  };

  const handleLoadSample = (sampleKey: string) => {
    if (SAMPLES[sampleKey]) {
      setLanguage(SAMPLES[sampleKey].language);
      setCode(SAMPLES[sampleKey].code);
      setErrorMessage(null);
      const extMap: Record<string, string> = {
        python: 'py',
        javascript: 'js',
        java: 'java',
        cpp: 'cpp'
      };
      setFilename(`sample_${sampleKey}.${extMap[sampleKey] || 'txt'}`);
    }
  };

  const handleClear = () => {
    setCode('');
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setErrorMessage(null);

    // Auto-detect language by file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'py') setLanguage('python');
    else if (ext === 'js' || ext === 'jsx') setLanguage('javascript');
    else if (ext === 'ts' || ext === 'tsx') setLanguage('typescript');
    else if (ext === 'java') setLanguage('java');
    else if (ext === 'cpp' || ext === 'cc' || ext === 'hpp') setLanguage('cpp');
    else if (ext === 'c' || ext === 'h') setLanguage('c');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content || '');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the uploaded file.');
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRunAnalysis = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter or upload valid source code before running the analyzer.');
      return;
    }
    setErrorMessage(null);
    try {
      await onAnalyze(code, language, filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please check the code.');
    }
  };

  // Map language for Monaco editor
  const monacoLang = (() => {
    const l = language.toLowerCase();
    if (l === 'c' || l === 'cpp') return 'cpp';
    if (l === 'js') return 'javascript';
    if (l === 'ts') return 'typescript';
    return l;
  })();

  const linesCount = (code || '').split('\n').length;
  const charsCount = (code || '').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10 flex flex-col h-[calc(100vh-7rem)]">
      {/* Control Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Language Selection & File Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="python">Python (AST Engine)</option>
              <option value="javascript">JavaScript (ES6+)</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java (Standard)</option>
              <option value="cpp">C++ (ISO / STL)</option>
              <option value="c">C (ANSI / C99)</option>
            </select>
          </div>

          {/* Preset Sample Code Quick Pills */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Test Samples:</span>
            {['python', 'javascript', 'java', 'cpp'].map((sKey) => (
              <button
                key={sKey}
                onClick={() => handleLoadSample(sKey)}
                disabled={loading}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                  language === sKey
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {sKey.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Upload, Clear, Analyze Actions */}
        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.cc,.c,.h,.hpp,.txt"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload source file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-xs font-medium text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing AST...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert if validation failed */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Code Editor Container */}
      <div className="flex-1 bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Editor Title Bar */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-200 font-semibold">{filename}</span>
            <span className="text-slate-400 font-sans">({language.toUpperCase()})</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>{linesCount} lines</span>
            <span>&bull;</span>
            <span>{charsCount} characters</span>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-[400px]">
          <Editor
            height="100%"
            language={monacoLang}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              lineNumbers: 'on',
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
};
