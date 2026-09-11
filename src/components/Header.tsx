import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Settings, 
  Radio, 
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { PresetScenario } from '../types/setu';
import { PRESET_SCENARIOS } from '../data/presetScenarios';

interface HeaderProps {
  onSelectPreset: (scenario: PresetScenario) => void;
  activeScenarioId?: string;
  onOpenSettings: () => void;
  onOpenAuditModal: () => void;
  backendOnline: boolean;
  hasGeminiKey: boolean;
  totalAudits: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  activeScenarioId,
  onOpenSettings,
  onOpenAuditModal,
  backendOnline,
  hasGeminiKey,
  totalAudits
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  सेतु
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  SETU
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
                    v1.0
                  </span>
                </h1>
                <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/50">
                  PromptWars × TechVerse
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-medium">
                Universal Bridge: Human Intent <span className="text-cyan-400">→</span> Verified Safety Actions
              </p>
            </div>
          </div>

          {/* Quick status indicators */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Scenario Preset Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 uppercase font-mono tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          {PRESET_SCENARIOS.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            const isEmergency = sc.category === 'EMERGENCY_RESPONSE';
            return (
              <button
                key={sc.id}
                onClick={() => onSelectPreset(sc)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? isEmergency 
                      ? 'bg-rose-500/20 text-rose-200 border-rose-500/60 shadow-sm shadow-rose-500/30 ring-1 ring-rose-500/40'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : isEmergency
                      ? 'bg-slate-900/90 text-rose-300/90 border-rose-900/50 hover:border-rose-700 hover:text-rose-200'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
                title={sc.description}
              >
                {isEmergency ? (
                  <HeartPulse className="w-3 h-3 text-rose-400 animate-pulse" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sc.category === 'INFRASTRUCTURE' ? 'bg-amber-400' :
                    sc.category === 'FINANCE' ? 'bg-emerald-400' :
                    sc.category === 'WORKPLACE' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                )}
                {sc.title.split(':')[0]}
                {isEmergency && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-rose-900/60 text-rose-300 rounded uppercase">
                    Primary
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System telemetry & Control actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Audit Trail Badge */}
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title="Inspect tamper-evident cryptographic audit chain"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Chain</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 font-semibold text-[10px]">
              {totalAudits}
            </span>
          </button>

          {/* Engine Status */}
          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-slate-400">
            <Radio className={`w-3.5 h-3.5 ${backendOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{backendOnline ? 'Kernel Online' : 'Local Sandbox'}</span>
          </div>

          {/* Gemini Mode Pill */}
          <div 
            onClick={onOpenSettings}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 text-slate-300"
            title="Click to configure Gemini API Key and Google Cloud credentials"
          >
            <Cpu className={`w-3.5 h-3.5 ${hasGeminiKey ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{hasGeminiKey ? 'Gemini 2.5 Flash' : 'Hybrid Pipeline'}</span>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            aria-label="Settings and API credentials"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
