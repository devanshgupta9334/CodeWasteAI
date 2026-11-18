import React, { useState, useEffect } from 'react';
import { NavigationPage, AnalysisResult, HistoryItem, UserSettings } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { CodeComparison } from './components/CodeComparison';
import { 
  checkHealth, 
  analyzeCode, 
  getHistory, 
  getHistoryDetail, 
  deleteHistoryItem, 
  clearAllHistory, 
  getSettings, 
  updateSettings, 
  downloadReportFile 
} from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    default_language: 'python',
    min_duplicate_lines: 3,
    detect_unused_vars: true,
    detect_unused_imports: true,
    detect_dead_code: true,
    detect_duplicate_code: true,
    detect_simplification: true,
    detect_inefficient_loops: true,
    auto_optimize: true,
    ai_api_key: '',
    ai_model: 'default'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        await checkHealth();
        setBackendHealthy(true);
      } catch (e) {
        setBackendHealthy(false);
      }

      try {
        const historyData = await getHistory();
        setHistory(historyData);
      } catch (e) {
        console.error('Failed to load history', e);
      }

      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };

    initApp();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Run code analysis
  const handleAnalyze = async (code: string, language: string, filename?: string) => {
    setLoading(true);
    try {
      const result = await analyzeCode(code, language, filename);
      setActiveResult(result);
      // Refresh history list
      const updatedHistory = await getHistory();
      setHistory(updatedHistory);
      setCurrentPage('results');
      showNotification('Analysis completed successfully!');
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reopen a past analysis from history or dashboard
  const handleSelectHistory = async (id: string) => {
    try {
      const detail = await getHistoryDetail(id);
      setActiveResult(detail);
      setCurrentPage('results');
    } catch (err) {
      alert('Failed to load analysis record.');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (activeResult?.id === id) {
        setActiveResult(null);
      }
      showNotification('Record deleted.');
    } catch (err) {
      alert('Failed to delete history record.');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearAllHistory();
      setHistory([]);
      setActiveResult(null);
      showNotification('History cleared.');
    } catch (err) {
      alert('Failed to clear history.');
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    try {
      const updated = await updateSettings(newSettings);
      setSettings(updated);
      showNotification('Settings saved.');
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'markdown' | 'json' = 'pdf') => {
    if (!activeResult) return;
    try {
      const blob = await downloadReportFile(activeResult.id, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `codewaste_report_${activeResult.title.replace(/\s+/g, '_')}.${format === 'markdown' ? 'md' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(`Report (${format.toUpperCase()}) downloaded!`);
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0d14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        hasActiveResult={!!activeResult}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header
          currentPage={currentPage}
          onQuickAnalyze={() => setCurrentPage('analyzer')}
          analysisCount={history.length}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 flex items-center gap-2 animate-bounce">
            <span>{notification}</span>
          </div>
        )}

        {/* Body Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentPage === 'dashboard' && (
            <DashboardPage
              history={history}
              onStartAnalysis={() => setCurrentPage('analyzer')}
              onSelectHistory={handleSelectHistory}
              activeResult={activeResult}
            />
          )}

          {currentPage === 'analyzer' && (
            <AnalyzerPage
              onAnalyze={handleAnalyze}
              loading={loading}
              defaultLanguage={settings.default_language}
            />
          )}

          {currentPage === 'results' && activeResult && (
            <ResultsPage
              result={activeResult}
              onOpenComparison={() => setCurrentPage('comparison')}
              onDownloadReport={() => handleDownloadReport('pdf')}
            />
          )}

          {currentPage === 'comparison' && activeResult && (
            <div className="h-[calc(100vh-7.5rem)]">
              <CodeComparison
                originalCode={activeResult.original_code}
                optimizedCode={activeResult.optimized_code || activeResult.original_code}
                language={activeResult.language}
                title={activeResult.title}
                onCopySuccess={() => showNotification('Optimized code copied to clipboard!')}
              />
            </div>
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              result={activeResult}
              onDownloadReport={handleDownloadReport}
              onNavigateToAnalyzer={() => setCurrentPage('analyzer')}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              history={history}
              onSelectRecord={handleSelectHistory}
              onDeleteRecord={handleDeleteHistory}
              onClearAll={handleClearHistory}
              onNavigateToAnalyzer={() => setCurrentPage('analyzer')}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onClearHistory={handleClearHistory}
            />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
