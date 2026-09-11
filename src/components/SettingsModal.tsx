import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Cloud, 
  Mail, 
  Check, 
  Info
} from 'lucide-react';
import { connectorRegistry } from '../services/connectors/connectorRegistry';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onSaveGeminiKey
}) => {
  const [localKey, setLocalKey] = useState(geminiKey);
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpToken, setGcpToken] = useState('');
  const [workspaceToken, setWorkspaceToken] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGeminiKey(localKey.trim());
    if (gcpProjectId) connectorRegistry.setCredential('GCP_PROJECT_ID', gcpProjectId.trim());
    if (gcpToken) connectorRegistry.setCredential('GOOGLE_CLOUD_TOKEN', gcpToken.trim());
    if (workspaceToken) connectorRegistry.setCredential('GOOGLE_WORKSPACE_TOKEN', workspaceToken.trim());
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const connectors = connectorRegistry.getAllConnectors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                SETU System & Live Connector Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Connect live Google Cloud & Gemini APIs or run in verified dry-run sandbox.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Transparency & Integrity Disclosure Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 block mb-0.5">Integrity Principle (Rule #7):</strong>
              SETU never fakes integrations or falsely reports external execution. When live credentials are provided, mutations run directly against real Google APIs. When run without credentials, SETU executes verified dry-run simulations with cryptographic evidence.
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span className="text-[10px] font-mono text-cyan-400">Optional: Falls back to Local Pipeline</span>
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500">
              Used for live Gemini 2.5 Flash situation modeling and decomposition. If left blank, SETU uses its deterministic local situation model.
            </p>
          </div>

          {/* Google Cloud Platform Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                Google Cloud Project ID
              </label>
              <input
                type="text"
                value={gcpProjectId}
                onChange={(e) => setGcpProjectId(e.target.value)}
                placeholder="e.g. setu-prod-cluster"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                GCP Auth Token / Service Key
              </label>
              <input
                type="password"
                value={gcpToken}
                onChange={(e) => setGcpToken(e.target.value)}
                placeholder="Bearer ya29..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Google Workspace OAuth Token */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Google Workspace OAuth Token (Calendar & Gmail)
            </label>
            <input
              type="password"
              value={workspaceToken}
              onChange={(e) => setWorkspaceToken(e.target.value)}
              placeholder="ya29.a0AfH6..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Registered Connectors Status Table */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider block">
              Active Connector Registry Status:
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {connectors.map((c, i) => (
                <div 
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <span className="text-slate-200 font-sans">{c.serviceName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                    c.isLiveConfigured 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-slate-900 text-cyan-400 border border-slate-800'
                  }`}>
                    {c.isLiveConfigured ? 'AUTHENTICATED LIVE' : 'SANDBOX DRY-RUN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Keys are kept in local memory and are never persisted externally.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/30"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Apply Configuration'
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
