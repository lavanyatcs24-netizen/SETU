import React from 'react';
import { 
  HelpCircle, 
  AlertOctagon, 
  Check, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AmbiguityAlert, ConflictItem } from '../types/setu';

interface AmbiguityAndConflictsProps {
  ambiguities: AmbiguityAlert[];
  conflicts: ConflictItem[];
  onResolveAmbiguity: (ambiguityId: string, optionId: string) => void;
  onOverrideConflict: (conflictId: string) => void;
}

export const AmbiguityAndConflicts: React.FC<AmbiguityAndConflictsProps> = ({
  ambiguities,
  conflicts,
  onResolveAmbiguity,
  onOverrideConflict
}) => {
  if (ambiguities.length === 0 && conflicts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Ambiguity & Uncertainty Handling */}
      {ambiguities.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Uncertainty & Ambiguity Resolution
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 text-[10px] border border-cyan-800/50">
                  {ambiguities.filter(a => !a.resolved).length} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                SETU identified ambiguous operational choices before dispatching mutations.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {ambiguities.map((amb) => (
              <div 
                key={amb.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  amb.resolved 
                    ? 'bg-slate-950/40 border-slate-800/60' 
                    : 'bg-cyan-950/20 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-100">
                    {amb.question}
                  </span>
                  {amb.resolved && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>

                {/* Clarification Options */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {amb.clarificationOptions.map((opt) => {
                    const isSelected = amb.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onResolveAmbiguity(amb.id, opt.id)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/40'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold flex items-center gap-1.5">
                            {opt.label}
                            {opt.isRecommended && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 font-mono">
                                RECOMMENDED
                              </span>
                            )}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {opt.impactDescription}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflict & Policy Blocker Detection */}
      {conflicts.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Policy & Conflict Enforcement Gates
                <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[10px] border border-rose-800/50">
                  {conflicts.filter(c => !c.isOverridden).length} Active Gates
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guards against irreversible side-effects, resource clashes, and SOX/compliance violations.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {conflicts.map((conf) => (
              <div 
                key={conf.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  conf.isOverridden
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : conf.severity === 'CRITICAL_BLOCKER'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${conf.severity === 'CRITICAL_BLOCKER' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                    {conf.title}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                    conf.severity === 'CRITICAL_BLOCKER' 
                      ? 'bg-rose-900/60 text-rose-300 border-rose-700/60' 
                      : 'bg-amber-900/60 text-amber-300 border-amber-700/60'
                  }`}>
                    {conf.severity.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {conf.description}
                </p>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 mb-3 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500 block mb-0.5">Remediation Protocol:</span>
                  {conf.remediationSuggestion}
                </div>

                {/* Conflicting entities and authorization action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500">Entities:</span>
                    {conf.conflictingEntities.map((ent, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                        {ent}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOverrideConflict(conf.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                      conf.isOverridden
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : conf.requiresDualSignoff
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {conf.isOverridden 
                      ? 'Dual-Key Authorized ✓' 
                      : conf.requiresDualSignoff 
                      ? 'Sign-Off & Authorize Gate' 
                      : 'Acknowledge Policy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
