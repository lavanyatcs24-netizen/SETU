import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Lock,
  ExternalLink,
  Layers,
  FileCode
} from 'lucide-react';
import { ActionNode } from '../types/setu';

interface NodeInspectorModalProps {
  node: ActionNode | null;
  onClose: () => void;
  onSignOffNode: (nodeId: string) => void;
  onSimulateNode: (node: ActionNode) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  onClose,
  onSignOffNode,
  onSimulateNode
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                {node.actionType}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                node.isIrreversible
                  ? 'bg-rose-950 text-rose-300 border-rose-800/50'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
              }`}>
                {node.isIrreversible ? 'IRREVERSIBLE' : 'REVERSIBLE'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {node.title}
            </h2>
            <p className="text-xs text-slate-400">
              Target Service: <span className="text-slate-200 font-semibold">{node.targetService}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Action Description */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 font-mono block mb-1 uppercase tracking-wider text-[10px]">Operational Objective:</span>
            <p className="text-slate-200 leading-relaxed">{node.description}</p>
          </div>

          {/* Verification Checks & Assertions */}
          <div className="space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Concrete Verification Checks & Invariants
            </span>
            <div className="space-y-1.5">
              {node.verificationChecks.map((vc) => (
                <div 
                  key={vc.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-100">{vc.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {vc.type}
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-cyan-300 block bg-slate-900/60 px-2 py-1 rounded">
                      {vc.assertion}
                    </code>
                    {vc.resultDetails && (
                      <span className="text-[11px] text-slate-400 block mt-1">
                        ↳ Result: {vc.resultDetails}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${
                    vc.status === 'PASS' 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                      : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                  }`}>
                    {vc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Diff (Before State vs After State) */}
          {node.simulationResult && (
            <div className="space-y-2">
              <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Dry-Run Simulation State Delta
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                {/* Diff Before */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40">
                  <span className="text-rose-400 font-bold block mb-1.5">State Before Execution:</span>
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(node.simulationResult.diffBefore, null, 2)}
                  </pre>
                </div>
                {/* Diff After */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                  <span className="text-emerald-400 font-bold block mb-1.5">State After Execution (Simulated):</span>
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(node.simulationResult.diffAfter, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Execution Receipt & Proof Hash */}
          {node.executionReceipt && (
            <div className={`p-4 rounded-xl border space-y-2.5 ${
              node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-950 border-cyan-500/40 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className={`w-4 h-4 ${node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  {node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE' 
                    ? 'Authenticated Live Production Receipt' 
                    : 'Simulated Dry-Run Receipt (Sandbox Mode)'}
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                    ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                }`}>
                  {node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE' ? 'LIVE MUTATION' : 'SIMULATED (NO LIVE CHANGES)'}
                </span>
              </div>

              <div className="font-mono text-[11px] space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-400">Proof Hash: </span>
                  <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">{node.executionReceipt.proofHash}</code>
                </div>
                <div>
                  <span className="text-slate-400">External Resource ID: </span>
                  {node.executionReceipt.externalResourceId ? (
                    <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">{node.executionReceipt.externalResourceId}</code>
                  ) : (
                    <span className="text-amber-400 font-semibold">None (Simulated in local sandbox — Rule #7 enforced)</span>
                  )}
                </div>

                <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed mt-2 ${
                  node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}>
                  <strong className="block mb-0.5 font-sans font-bold">
                    {node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE' ? 'Production Verification Notice:' : 'Simulation Transparency Disclosure:'}
                  </strong>
                  {node.executionReceipt.disclaimer}
                </div>
              </div>
            </div>
          )}

          {/* Rollback Procedure */}
          {node.rollbackAction && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 text-amber-400" /> Automated Rollback Safety Plan
              </span>
              <p className="text-slate-200 font-semibold">{node.rollbackAction.title}</p>
              <p className="text-slate-400">{node.rollbackAction.procedure}</p>
            </div>
          )}

          {/* Parameters Viewer */}
          <div className="space-y-1">
            <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-400" /> Invocation Parameters
            </span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(node.parameters, null, 2)}
            </pre>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSimulateNode(node)}
            className="px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Single Node
          </button>

          <div className="flex items-center gap-2">
            {node.status === 'WAITING_HUMAN_SIGN_OFF' && (
              <button
                type="button"
                onClick={() => {
                  onSignOffNode(node.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign-Off & Authorize Gate
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
