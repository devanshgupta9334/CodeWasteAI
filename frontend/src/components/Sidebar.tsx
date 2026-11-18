import React from 'react';
import { NavigationPage } from '../types';
import { 
  LayoutDashboard, 
  Code2, 
  CheckCircle2, 
  SplitSquareVertical, 
  BarChart3, 
  History, 
  Settings, 
  ShieldAlert, 
  Sparkles,
  Zap
} from 'lucide-react';

interface Props {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  hasActiveResult: boolean;
  backendHealthy: boolean;
}

export const Sidebar: React.FC<Props> = ({
  currentPage,
  onNavigate,
  hasActiveResult,
  backendHealthy
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer' as NavigationPage, label: 'Code Analyzer', icon: Code2, badge: 'Core' },
    { id: 'results' as NavigationPage, label: 'Analysis Results', icon: CheckCircle2, disabled: !hasActiveResult },
    { id: 'comparison' as NavigationPage, label: 'Before & After', icon: SplitSquareVertical, disabled: !hasActiveResult },
    { id: 'reports' as NavigationPage, label: 'Optimization Reports', icon: BarChart3 },
    { id: 'history' as NavigationPage, label: 'Analysis History', icon: History },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d121f] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">CodeWaste</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                Detector &bull; Optimizer
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-600/20'
                    : isDisabled
                    ? 'text-slate-400 opacity-50 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Backend health */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300">Analysis Engine</span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400'}`}></span>
              <span className={backendHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                {backendHealthy ? 'AST Engine Online' : 'Connecting...'}
              </span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Multi-pass AST inspection & Rabin-Karp duplication matching
          </p>
        </div>

        <div className="text-[11px] text-slate-400 text-center">
          CodeWaste Detector &bull; Academic Edition
        </div>
      </div>
    </aside>
  );
};
