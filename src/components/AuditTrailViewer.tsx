import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Download, 
  Search, 
  Link as LinkIcon, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Hash
} from 'lucide-react';
import { AuditEntry } from '../types/setu';
import { auditService } from '../services/auditService';

interface AuditTrailViewerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditEntry[];
  onRefreshEntries: () => void;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  isOpen,
  onClose,
  entries,
  onRefreshEntries
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    tested: boolean;
    isValid: boolean;
    count: number;
    brokenIndex?: number;
  }>({ tested: false, isValid: true, count: 0 });

  if (!isOpen) return null;

  const filteredEntries = entries.filter(e => 
    e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.evidenceHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 600)); // smooth verification animation
    const result = await auditService.verifyFullChain();
    setVerificationStatus({
      tested: true,
      isValid: result.isValid,
      count: result.count,
      brokenIndex: result.brokenIndex
    });
    setIsVerifying(false);
    onRefreshEntries();
  };

  const handleExportJson = () => {
    const jsonStr = auditService.exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setu-cryptographic-audit-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventBadge = (type: AuditEntry['eventType']) => {
    switch (type) {
      case 'ACTION_EXECUTED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800/60';
      case 'SIMULATION_EXECUTED':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800/60';
      case 'CONFLICT_DETECTED':
        return 'bg-rose-950 text-rose-300 border-rose-800/60';
      case 'HUMAN_APPROVAL_GRANTED':
        return 'bg-amber-950 text-amber-300 border-amber-800/60';
      case 'REASONING_COMPLETED':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Tamper-Evident Immutable Audit Trail
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  SHA-256 Chained
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Non-repudiable ledger of human intents, Gemini situation models, simulation proofs, and authorized mutations.
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

        {/* Verification Status & Action Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail by actor, hash, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-emerald-400' : ''}`} />
              {isVerifying ? 'Validating Hashes...' : 'Verify Cryptographic Integrity'}
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Download raw audit ledger as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {verificationStatus.tested && (
          <div className={`px-4 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
            verificationStatus.isValid 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            <div className="flex items-center gap-2">
              {verificationStatus.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
              <span>
                {verificationStatus.isValid 
                  ? `Cryptographic validation PASSED for all ${verificationStatus.count} blocks. Merkle links and parent hashes verified.` 
                  : `WARNING: Tampering detected at block index ${verificationStatus.brokenIndex}!`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Web Crypto API Tested</span>
          </div>
        )}

        {/* Audit Log Entries List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 relative"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">#{entry.id.replace('audit-block-', '')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getEventBadge(entry.eventType)}`}>
                    {entry.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300 font-semibold">{entry.actorName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {entry.details}
              </p>

              {/* Cryptographic Hashes */}
              <div className="pt-2 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div className="truncate flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-slate-500">Evidence Hash:</span>
                  <span className="text-cyan-300 font-mono truncate">{entry.evidenceHash}</span>
                </div>
                <div className="truncate flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="text-slate-500">Previous Hash:</span>
                  <span className="text-slate-400 font-mono truncate">{entry.previousHash}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No audit records match your query.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Total Blocks: <strong className="text-white">{entries.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
