import React from 'react';
import { 
  GitCommit, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Lock, 
  ChevronRight, 
  Eye 
} from 'lucide-react';
import { ActionGraph, ActionNode } from '../types/setu';

interface ActionGraphDAGProps {
  actionGraph: ActionGraph;
  selectedNodeId?: string;
  onSelectNode: (node: ActionNode) => void;
  onSimulateAll: () => void;
  onExecuteAll: () => void;
  isSimulating: boolean;
  isExecuting: boolean;
  hasUnresolvedBlockers: boolean;
}

export const ActionGraphDAG: React.FC<ActionGraphDAGProps> = ({
  actionGraph,
  selectedNodeId,
  onSelectNode,
  onSimulateAll,
  onExecuteAll,
  isSimulating,
  isExecuting,
  hasUnresolvedBlockers
}) => {
  const nodes = actionGraph.nodes;

  const getNodeStatusBadge = (node: ActionNode) => {
    if (node.status === 'SUCCESS') {
      if (node.executionReceipt?.connectorMode === 'AUTHENTICATED_LIVE') {
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LIVE EXECUTED
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 font-bold">
          <Sparkles className="w-3 h-3 text-cyan-400" /> SIMULATED IN SANDBOX
        </span>
      );
    }

    switch (node.status) {
      case 'SIMULATED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
            <Sparkles className="w-3 h-3 text-cyan-400" /> DRY-RUN SIMULATED
          </span>
        );
      case 'WAITING_HUMAN_SIGN_OFF':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold animate-pulse">
            <Lock className="w-3 h-3 text-amber-400" /> SIGN-OFF REQUIRED
          </span>
        );
      case 'CONFLICT_BLOCKED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 font-semibold">
            <AlertCircle className="w-3 h-3 text-rose-400" /> BLOCKED BY POLICY
          </span>
        );
      case 'EXECUTING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700/60 font-semibold animate-pulse">
            <Zap className="w-3 h-3 text-blue-400 animate-spin" /> DISPATCHING...
          </span>
        );
      case 'VERIFIED':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" /> VERIFIED PRE-CHECKS
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      
      {/* Action Header & Orchestration Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitCommit className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Interactive Action Execution Graph (DAG)
              <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {nodes.length} Steps
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topologically sorted execution graph. Click any node to inspect verification assertions, invariants, and rollback plans.
          </p>
        </div>

        {/* Global Pipeline Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dry Run Simulation Button */}
          <button
            type="button"
            onClick={onSimulateAll}
            disabled={isSimulating || isExecuting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Simulate complete DAG execution without external side effects"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'text-cyan-400'}`} />
            {isSimulating ? 'Simulating Dry-Run...' : 'Pre-Flight Dry-Run'}
          </button>

          {/* Authorize & Execute Button */}
          <button
            type="button"
            onClick={onExecuteAll}
            disabled={isExecuting || isSimulating || hasUnresolvedBlockers}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-md ${
              hasUnresolvedBlockers
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
            }`}
            title={hasUnresolvedBlockers ? 'Resolve critical policy gates above before executing' : 'Dispatch verified actions to connector layer'}
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : 'fill-current'}`} />
            {isExecuting ? 'Dispatching Mutations...' : 'Authorize & Execute Graph'}
          </button>
        </div>
      </div>

      {/* Visual DAG Flow Canvas */}
      <div className="relative py-2">
        <div className="space-y-4">
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const passedChecks = node.verificationChecks.filter(vc => vc.status === 'PASS').length;
            const totalChecks = node.verificationChecks.length;

            return (
              <div key={node.id} className="relative group">
                
                {/* Connector Line to next node */}
                {index < nodes.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 via-cyan-500/50 to-slate-800 pointer-events-none -mb-4 z-0" />
                )}

                <div 
                  onClick={() => onSelectNode(node)}
                  className={`relative z-10 p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Step Icon & Title */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                        node.status === 'SUCCESS' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : node.status === 'WAITING_HUMAN_SIGN_OFF'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {node.title}
                          </h3>
                          {getNodeStatusBadge(node)}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                          {node.description}
                        </p>

                        {/* Metadata Pills: Target service, Irreversibility, Verification assertions */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            Service: <strong className="text-slate-100">{node.targetService}</strong>
                          </span>

                          <span className={`px-2 py-0.5 rounded border ${
                            node.isIrreversible
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                          }`}>
                            {node.isIrreversible ? '⚠️ IRREVERSIBLE ACTION' : '✓ REVERSIBLE WITH ROLLBACK'}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                            Verification: {passedChecks}/{totalChecks} Passed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right action inspect affordance */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(node);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Simulation / Execution Mini-Receipt Bar if available */}
                  {node.simulationResult && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Dry-Run Proof Generated ({node.simulationResult.simulatedLatencyMs}ms)
                      </span>
                      <span className="text-slate-500 truncate max-w-xs">
                        State Diff: {Object.keys(node.simulationResult.diffAfter).join(', ')}
                      </span>
                    </div>
                  )}

                  {node.executionReceipt && (
                    <div className={`mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono p-2.5 rounded-lg ${
                      node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                        ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-200'
                        : 'border-cyan-500/40 bg-slate-900 text-cyan-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                            ? 'bg-emerald-900 text-emerald-300 border border-emerald-600'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        }`}>
                          {node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE' ? 'LIVE MUTATION' : 'SIMULATED (NO LIVE EXTERNAL ACTION)'}
                        </span>
                        <span className="text-slate-300 font-sans text-xs">
                          {node.executionReceipt.connectorMode === 'AUTHENTICATED_LIVE'
                            ? 'Executed via authenticated Google Cloud API'
                            : 'Verified & simulated locally in sandbox'}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        Proof: {node.executionReceipt.proofHash.substring(0, 16)}...
                      </span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
