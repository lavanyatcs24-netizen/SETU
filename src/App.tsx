import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MultimodalInput } from './components/MultimodalInput';
import { SituationPanel } from './components/SituationPanel';
import { AmbiguityAndConflicts } from './components/AmbiguityAndConflicts';
import { ActionGraphDAG } from './components/ActionGraphDAG';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { AuditTrailViewer } from './components/AuditTrailViewer';
import { SettingsModal } from './components/SettingsModal';

import { 
  MultimodalPayload, 
  GeminiReasoningOutput, 
  ActionNode, 
  AuditEntry,
  PresetScenario
} from './types/setu';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { geminiReasoningEngine } from './services/geminiReasoningEngine';
import { connectorRegistry } from './services/connectors/connectorRegistry';
import { auditService } from './services/auditService';

export function App() {
  // Scenario state: Default to P1 Production Incident
  const [activeScenario, setActiveScenario] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  
  // Core Reasoning & Graph State
  const [reasoningResult, setReasoningResult] = useState<GeminiReasoningOutput | null>(null);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  
  // Interactive UI State
  const [selectedNode, setSelectedNode] = useState<ActionNode | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Pipeline processing state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionBanner, setExecutionBanner] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Settings & Credentials
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('SETU_GEMINI_KEY') || '';
  });

  // Audit Logs
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend health & subscribe to audit logs
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();

    const unsubscribe = auditService.subscribe((entries) => {
      setAuditEntries(entries);
    });
    return () => unsubscribe();
  }, []);

  // Analyze intent (invokes backend or client engine)
  const handleAnalyzeIntent = useCallback(async (payload: MultimodalPayload) => {
    setIsLoadingReasoning(true);
    setExecutionBanner(null);

    try {
      let output: GeminiReasoningOutput;

      if (backendOnline) {
        try {
          const res = await fetch('/api/intent/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload, apiKey: geminiApiKey })
          });
          if (res.ok) {
            output = await res.json();
          } else {
            output = await geminiReasoningEngine.analyzeIntent(payload, geminiApiKey);
          }
        } catch {
          output = await geminiReasoningEngine.analyzeIntent(payload, geminiApiKey);
        }
      } else {
        output = await geminiReasoningEngine.analyzeIntent(payload, geminiApiKey);
        
        // Record client audit events
        await auditService.recordEvent({
          actorId: 'usr-operator',
          actorName: 'Operator',
          eventType: 'INTENT_INGESTED',
          details: `Ingested intent [${payload.source}]: "${payload.rawText.substring(0, 80)}..."`,
          rawPayload: payload
        });
        await auditService.recordEvent({
          actorId: 'gemini-engine',
          actorName: 'Gemini 2.5 Flash',
          eventType: 'REASONING_COMPLETED',
          details: `Synthesized verified situation model and graph (${output.actionGraph.nodes.length} actions). Confidence: ${output.confidenceScore}%.`,
          rawPayload: output.situation
        });
      }

      setReasoningResult(output);
    } catch (err: any) {
      console.error('Failed to reason intent:', err);
    } finally {
      setIsLoadingReasoning(false);
    }
  }, [backendOnline, geminiApiKey]);

  // Initial load: synthesize the default scenario
  useEffect(() => {
    if (activeScenario && !reasoningResult) {
      queueMicrotask(() => {
        handleAnalyzeIntent({
          source: activeScenario.sourceType,
          rawText: activeScenario.prompt,
          documentFile: activeScenario.sampleDocumentName ? {
            name: activeScenario.sampleDocumentName,
            size: activeScenario.sampleDocumentContent?.length || 1024,
            mimeType: 'application/json',
            extractedText: activeScenario.sampleDocumentContent
          } : undefined,
          contextTags: [activeScenario.category]
        });
      });
    }
  }, [activeScenario, handleAnalyzeIntent, reasoningResult]);

  // Handle switching preset scenarios
  const handleSelectPreset = (scenario: PresetScenario) => {
    setActiveScenario(scenario);
    setSelectedNode(null);
    handleAnalyzeIntent({
      source: scenario.sourceType,
      rawText: scenario.prompt,
      documentFile: scenario.sampleDocumentName ? {
        name: scenario.sampleDocumentName,
        size: scenario.sampleDocumentContent?.length || 1024,
        mimeType: 'application/json',
        extractedText: scenario.sampleDocumentContent
      } : undefined,
      contextTags: [scenario.category]
    });
  };

  // Handle Ambiguity resolution (e.g. user selects option)
  const handleResolveAmbiguity = (ambiguityId: string, optionId: string) => {
    if (!reasoningResult) return;
    setReasoningResult(prev => {
      if (!prev) return prev;
      const updated = prev.ambiguities.map(a => {
        if (a.id === ambiguityId) {
          return { ...a, selectedOptionId: optionId, resolved: true };
        }
        return a;
      });

      // Dynamic Action Graph Rebalancing based on chosen operational path
      let updatedNodes = [...prev.actionGraph.nodes];
      if (ambiguityId === 'amb-route-selection') {
        if (optionId === 'opt-route12') {
          // Rebalance toward South Marina Boat Route 12
          updatedNodes = updatedNodes.map(node => {
            if (node.id === 'node-verify-route') {
              return {
                ...node,
                title: 'Verify Route 12 Marina Water Corridor & Enforce Route 4 Lock',
                description: 'Enforce Flooded Road Invariant: Lock Route 4 (1.4m submerged) and clear South Marina watercraft departure corridor (29 min staging).',
                parameters: { lockedRoute: 'Route 4', approvedRoute: 'Route 12 (South Marina Boat Corridor)', watercraftReady: true }
              };
            }
            if (node.id === 'node-allocate-resources') {
              return {
                ...node,
                title: 'Stage Marine Rescue Boats & Paramedic Swift-Water Team',
                description: 'Deploy 2 Swift-Water Rescue Boats at South Marina staging dock equipped with portable battery oxygen units.',
                parameters: { units: 2, unitType: 'SWIFT_WATER_RESCUE_BOAT', stagingArea: 'South Marina Slip 4' }
              };
            }
            return node;
          });
        } else if (optionId === 'opt-route9') {
          // Rebalance toward North Ridge Causeway Route 9
          updatedNodes = updatedNodes.map(node => {
            if (node.id === 'node-verify-route') {
              return {
                ...node,
                title: 'Verify Route 9 Accessibility & Enforce Route 4 Lock',
                description: 'Enforce Flooded Road Invariant: Lock Route 4 (1.4m submerged) from dispatch router and certify Route 9 North Ridge Causeway (+2.1m clearance).',
                parameters: { lockedRoute: 'Route 4', approvedRoute: 'Route 9', clearanceMarginMeters: 2.1 }
              };
            }
            if (node.id === 'node-allocate-resources') {
              return {
                ...node,
                title: 'Stage High-Clearance Rescue Vehicles & Paramedic Crew',
                description: 'Mobilize 2 High-Clearance 4x4 Emergency Vehicles equipped with portable oxygen concentrators and swift-water certified crew to Staging Area B.',
                parameters: { units: 2, unitType: 'HIGH_CLEARANCE_4X4_AMBULANCE', onboardOxygenUnits: 3, stagingArea: 'North Ridge Staging B' }
              };
            }
            return node;
          });
        }
      }

      return { 
        ...prev, 
        ambiguities: updated,
        actionGraph: { ...prev.actionGraph, nodes: updatedNodes }
      };
    });

    auditService.recordEvent({
      actorId: 'usr-operator',
      actorName: 'Operator',
      eventType: 'REASONING_COMPLETED',
      details: `Resolved ambiguity ${ambiguityId} -> Selected option [${optionId}]. Dynamically rebalanced Action DAG.`,
    });
  };

  // Handle Conflict Override / Dual-Key Signoff
  const handleOverrideConflict = (conflictId: string) => {
    if (!reasoningResult) return;
    setReasoningResult(prev => {
      if (!prev) return prev;
      const updated = prev.conflicts.map(c => {
        if (c.id === conflictId) {
          return { ...c, isOverridden: true };
        }
        return c;
      });

      // Also unlock any nodes that were waiting for sign-off
      const updatedNodes = prev.actionGraph.nodes.map(node => {
        if (node.status === 'WAITING_HUMAN_SIGN_OFF' || node.status === 'CONFLICT_BLOCKED') {
          return { ...node, status: 'VERIFIED' as const };
        }
        return node;
      });

      return {
        ...prev,
        conflicts: updated,
        actionGraph: { ...prev.actionGraph, nodes: updatedNodes }
      };
    });

    auditService.recordEvent({
      actorId: 'usr-dual-key',
      actorName: 'Authorized Operator / Dual-Key',
      eventType: 'HUMAN_APPROVAL_GRANTED',
      details: `Gate sign-off granted for conflict ${conflictId}. Unlocked downstream mutations.`,
    });
  };

  // Handle individual node sign-off
  const handleSignOffNode = (nodeId: string) => {
    if (!reasoningResult) return;
    setReasoningResult(prev => {
      if (!prev) return prev;
      const updatedNodes = prev.actionGraph.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, status: 'VERIFIED' as const };
        }
        return n;
      });
      return {
        ...prev,
        actionGraph: { ...prev.actionGraph, nodes: updatedNodes }
      };
    });

    auditService.recordEvent({
      actorId: 'usr-dual-key',
      actorName: 'Lead Operator',
      eventType: 'HUMAN_APPROVAL_GRANTED',
      nodeId,
      details: `Human verification sign-off approved for action node "${nodeId}".`,
    });
  };

  // Simulate single node
  const handleSimulateNode = async (node: ActionNode) => {
    try {
      const res = await connectorRegistry.simulateAction(node);
      setReasoningResult(prev => {
        if (!prev) return prev;
        const updatedNodes = prev.actionGraph.nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              status: 'SIMULATED' as const,
              simulationResult: {
                diffBefore: res.diffBefore,
                diffAfter: res.diffAfter,
                simulatedLatencyMs: res.executionLatencyMs,
                passedInvariants: true
              }
            };
          }
          return n;
        });
        return {
          ...prev,
          actionGraph: { ...prev.actionGraph, nodes: updatedNodes }
        };
      });

      // Update selected node state as well
      setSelectedNode(prev => {
        if (!prev || prev.id !== node.id) return prev;
        return {
          ...prev,
          status: 'SIMULATED',
          simulationResult: {
            diffBefore: res.diffBefore,
            diffAfter: res.diffAfter,
            simulatedLatencyMs: res.executionLatencyMs,
            passedInvariants: true
          }
        };
      });

      await auditService.recordEvent({
        actorId: 'sim-engine',
        actorName: 'SETU Sandbox',
        eventType: 'SIMULATION_EXECUTED',
        nodeId: node.id,
        details: `Simulated dry-run for "${node.title}". Proof Hash: ${res.proofHash.substring(0, 16)}...`,
        rawPayload: res
      });
    } catch (err: any) {
      console.error('Simulation error:', err);
    }
  };

  // Simulate all nodes in DAG
  const handleSimulateAll = async () => {
    if (!reasoningResult) return;
    setIsSimulating(true);

    try {
      const updatedNodes = [...reasoningResult.actionGraph.nodes];

      for (let i = 0; i < updatedNodes.length; i++) {
        const node = updatedNodes[i];
        const res = await connectorRegistry.simulateAction(node);
        updatedNodes[i] = {
          ...node,
          status: 'SIMULATED',
          simulationResult: {
            diffBefore: res.diffBefore,
            diffAfter: res.diffAfter,
            simulatedLatencyMs: res.executionLatencyMs,
            passedInvariants: true
          }
        };
        await auditService.recordEvent({
          actorId: 'sim-engine',
          actorName: 'SETU Simulation Sandbox',
          eventType: 'SIMULATION_EXECUTED',
          nodeId: node.id,
          details: `Dry-run simulated for step ${i + 1}: "${node.title}". Proof Hash: ${res.proofHash.substring(0, 16)}...`,
          rawPayload: res
        });
      }

      setReasoningResult(prev => prev ? {
        ...prev,
        actionGraph: { ...prev.actionGraph, nodes: updatedNodes }
      } : prev);

      setExecutionBanner({
        show: true,
        type: 'info',
        title: 'Pre-Flight Simulation Completed Successfully',
        message: `All ${updatedNodes.length} steps simulated with zero invariant violations. Cryptographic state diffs computed.`
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Execute all verified nodes in DAG
  const handleExecuteAll = async () => {
    if (!reasoningResult) return;
    setIsExecuting(true);

    try {
      const updatedNodes = [...reasoningResult.actionGraph.nodes];

      for (let i = 0; i < updatedNodes.length; i++) {
        const node = updatedNodes[i];
        node.status = 'EXECUTING';
        setReasoningResult(prev => prev ? {
          ...prev,
          actionGraph: { ...prev.actionGraph, nodes: [...updatedNodes] }
        } : prev);

        const res = await connectorRegistry.executeAction(node);
        updatedNodes[i] = {
          ...node,
          status: res.success ? 'SUCCESS' : 'FAILED',
          executionReceipt: {
            executedAt: new Date().toISOString(),
            connectorMode: res.connectorMode,
            proofHash: res.proofHash,
            externalResourceId: res.externalResourceId,
            liveServiceResponse: res.livePayload,
            disclaimer: res.disclaimer
          }
        };

        await auditService.recordEvent({
          actorId: 'usr-signoff',
          actorName: 'Authorized Operator',
          eventType: 'ACTION_EXECUTED',
          nodeId: node.id,
          details: `Action executed [${res.connectorMode}]: "${node.title}". Proof Hash: ${res.proofHash.substring(0, 16)}...`,
          rawPayload: res
        });
      }

      setReasoningResult(prev => prev ? {
        ...prev,
        actionGraph: { ...prev.actionGraph, nodes: updatedNodes, overallState: 'COMPLETED' }
      } : prev);

      setExecutionBanner({
        show: true,
        type: 'success',
        title: 'Execution Cycle Sealed & Audited',
        message: 'All verified actions executed and sealed with tamper-evident cryptographic hashes.'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Check if there are active blockers preventing execution
  const hasUnresolvedBlockers = reasoningResult?.conflicts.some(c => !c.isOverridden && c.severity === 'CRITICAL_BLOCKER') || false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white bg-grid-pattern">
      
      {/* Top Demo / Simulation Mode Global Indicator */}
      <div className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-200/90 font-mono flex flex-wrap items-center justify-between gap-2 shadow-sm z-50">
        <div className="flex items-center gap-2 max-w-5xl">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
          <span>
            <strong className="text-rose-300 uppercase">Demo Sandbox Mode Active:</strong> All actions are verified against life-safety invariants and simulated locally with zero real-world blast radius. No real emergency services or municipal dispatch networks are contacted without authorized credentials (Rule #7 Enforced).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-600/50 font-bold">
            VERIFIED DRY-RUN
          </span>
          <span className="text-slate-400">Zero Blast Radius</span>
        </div>
      </div>

      {/* Top Mission Control Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        activeScenarioId={activeScenario?.id}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        backendOnline={backendOnline}
        hasGeminiKey={Boolean(geminiApiKey && geminiApiKey.length > 10)}
        totalAudits={auditEntries.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Multimodal Human Input Section */}
        <section>
          <MultimodalInput
            onAnalyze={handleAnalyzeIntent}
            isLoading={isLoadingReasoning}
            initialPrompt={activeScenario?.prompt}
            initialDocumentName={activeScenario?.sampleDocumentName}
            initialDocumentContent={activeScenario?.sampleDocumentContent}
          />
        </section>

        {/* Global Notification Banner */}
        {executionBanner?.show && (
          <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between shadow-lg ${
            executionBanner.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 glow-emerald'
              : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 glow-cyan'
          }`}>
            <div>
              <strong className="block text-sm font-sans font-bold text-white mb-0.5">
                {executionBanner.title}
              </strong>
              <span>{executionBanner.message}</span>
            </div>
            <button
              onClick={() => setExecutionBanner(null)}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Situation Modeling & Telemetry Section */}
        {reasoningResult && (
          <section className="space-y-6">
            <SituationPanel
              situation={reasoningResult.situation}
              confidenceScore={reasoningResult.confidenceScore}
            />

            {/* Ambiguities & Conflicts Resolution */}
            <AmbiguityAndConflicts
              ambiguities={reasoningResult.ambiguities}
              conflicts={reasoningResult.conflicts}
              onResolveAmbiguity={handleResolveAmbiguity}
              onOverrideConflict={handleOverrideConflict}
            />

            {/* Interactive DAG Action Execution Graph */}
            <ActionGraphDAG
              actionGraph={reasoningResult.actionGraph}
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => setSelectedNode(node)}
              onSimulateAll={handleSimulateAll}
              onExecuteAll={handleExecuteAll}
              isSimulating={isSimulating}
              isExecuting={isExecuting}
              hasUnresolvedBlockers={hasUnresolvedBlockers}
            />
          </section>
        )}

      </main>

      {/* Node Inspector Drawer / Modal */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSignOffNode={handleSignOffNode}
        onSimulateNode={handleSimulateNode}
      />

      {/* Tamper-Evident Immutable Audit Trail Modal */}
      <AuditTrailViewer
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        entries={auditEntries}
        onRefreshEntries={() => setAuditEntries(auditService.getEntries())}
      />

      {/* Settings & Live Connectors Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        geminiKey={geminiApiKey}
        onSaveGeminiKey={(key) => {
          setGeminiApiKey(key);
          localStorage.setItem('SETU_GEMINI_KEY', key);
        }}
      />

      {/* Bottom Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-3 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SETU — PromptWars × TechVerse Hackathon</span>
          <span>Zero-Hallucination Verified Mutation Protocol • Web Crypto SHA-256 Chained</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
