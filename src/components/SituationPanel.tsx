import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Lock,
  Gauge
} from 'lucide-react';
import { SituationModel } from '../types/setu';

interface SituationPanelProps {
  situation: SituationModel;
  confidenceScore: number;
}

export const SituationPanel: React.FC<SituationPanelProps> = ({
  situation,
  confidenceScore
}) => {
  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    if (score > 35) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  };

  const getBlastRadiusBadge = (blast: SituationModel['blastRadius']) => {
    switch (blast) {
      case 'GLOBAL_PRODUCTION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> GLOBAL PRODUCTION
          </span>
        );
      case 'CROSS_SYSTEM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> CROSS-SYSTEM
          </span>
        );
      case 'TEAM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> TEAM LEVEL
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ISOLATED
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top Header: Situation Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Situation Model & Invariant State
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {situation.summary}
            </p>
          </div>
        </div>

        {/* Vital Gauges */}
        <div className="flex items-center gap-3">
          {/* Confidence Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block leading-tight">Confidence</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{confidenceScore}%</span>
            </div>
          </div>

          {/* Operational Risk Score */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getRiskColor(situation.operationalRiskScore)}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono block leading-tight">Risk Score</span>
              <span className="text-xs font-mono font-bold">{situation.operationalRiskScore}/100</span>
            </div>
          </div>

          {/* Blast Radius */}
          <div>{getBlastRadiusBadge(situation.blastRadius)}</div>
        </div>
      </div>

      {/* Grid: Target Systems, Actors, and Invariants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* Column 1: Target Systems */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> Target Systems
            </span>
            <span className="text-slate-500">{situation.targetSystems.length} entities</span>
          </div>
          <div className="space-y-1.5">
            {situation.targetSystems.map((sys) => (
              <div 
                key={sys.id}
                className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-200 block truncate">{sys.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{sys.type}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${
                    sys.status === 'healthy' ? 'bg-emerald-400' :
                    sys.status === 'degraded' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                  }`} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {sys.environment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Actors & Dual-Key Authorization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Stakeholders & Roles
            </span>
            <span className="text-slate-500">{situation.actors.length} actors</span>
          </div>
          <div className="space-y-1.5">
            {situation.actors.map((actor) => (
              <div 
                key={actor.id}
                className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{actor.name}</span>
                  <span className="text-[10px] text-slate-400">{actor.role}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  actor.authorizationLevel === 'DUAL_KEY' 
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' 
                    : actor.authorizationLevel === 'ADMIN'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                    : 'bg-slate-900 text-cyan-300 border-cyan-800/60'
                }`}>
                  {actor.authorizationLevel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Active Constraints & Policies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Invariant Constraints
            </span>
            <span className="text-slate-500">{situation.activeConstraints.length} active</span>
          </div>
          <div className="space-y-1.5">
            {situation.activeConstraints.map((c) => (
              <div 
                key={c.id}
                className={`p-2 rounded-xl border text-xs ${
                  c.isViolated 
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' 
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-slate-200 truncate pr-1">{c.title}</span>
                  {c.isViolated ? (
                    <span className="text-[10px] font-mono font-bold text-rose-400 px-1 rounded bg-rose-900/50">VIOLATED</span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {c.description}
                </p>
                {c.violationReason && (
                  <p className="text-[10px] font-mono text-rose-400 mt-1">
                    ↳ {c.violationReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
