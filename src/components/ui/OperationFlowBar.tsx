import React from 'react';
import { Operation, ProductionState } from '../../types';
import { Check, Clock, AlertTriangle } from 'lucide-react';

interface OperationFlowBarProps {
  operations?: Operation[];
  currentOperationName?: string;
  className?: string;
  onSelectOperation?: (op: Operation) => void;
}

const STATE_CONFIG: Record<ProductionState, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  COMPLETED: { label: 'COMPLETED', badge: 'bg-emerald-50 text-emerald-900 border-emerald-400', icon: Check },
  IN_PROGRESS: { label: 'ACTIVE', badge: 'bg-orange-50 text-amber-950 border-forge-orange/60 font-bold', icon: Clock },
  ON_HOLD: { label: 'ON HOLD', badge: 'bg-amber-50 text-amber-950 border-amber-400', icon: AlertTriangle },
  NOT_STARTED: { label: 'QUEUED', badge: 'bg-slate-100 text-slate-800 border-slate-300', icon: Clock }
};

export const OperationFlowBar: React.FC<OperationFlowBarProps> = ({
  operations = [],
  currentOperationName,
  className = '',
  onSelectOperation
}) => {
  if (!operations || operations.length === 0) {
    return (
      <div className={`p-3 bg-forge-alabaster border border-forge-aluminum font-mono text-xs text-forge-steel ${className}`}>
        No discrete routing steps defined for this work order.
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between font-mono text-[10px] text-forge-steel gap-1">
        <span className="uppercase tracking-wider font-semibold text-forge-black">
          ROUTING PIPELINE ({operations.length} OPERATIONS)
        </span>
        <span>STEP SEQUENCE • PLANNED VS ACTUAL TIME</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {operations.map((op) => {
          const cfg = STATE_CONFIG[op.state] || STATE_CONFIG.NOT_STARTED;
          const Icon = cfg.icon;
          const isActive = op.state === 'IN_PROGRESS' || (currentOperationName && currentOperationName.includes(`Op ${op.stepNumber}`));
          const deltaMinutes = op.actualMinutes - op.plannedMinutes;
          const isOverrun = op.state === 'COMPLETED' && deltaMinutes > 0;

          return (
            <div
              key={op.id}
              role={onSelectOperation ? "button" : undefined}
              tabIndex={onSelectOperation ? 0 : undefined}
              aria-label={onSelectOperation ? `Operation ${op.stepNumber}: ${op.name}, state ${op.state}` : undefined}
              onClick={() => onSelectOperation && onSelectOperation(op)}
              onKeyDown={(e) => {
                if (onSelectOperation && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectOperation(op);
                }
              }}
              className={`p-2.5 border transition-all relative flex flex-col justify-between ${
                onSelectOperation ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange' : ''
              } ${
                isActive
                  ? 'border-forge-orange bg-forge-orange-light/50 shadow-flat ring-1 ring-forge-orange'
                  : op.state === 'COMPLETED'
                  ? 'border-forge-aluminum bg-white hover:border-forge-steel'
                  : 'border-forge-aluminum/60 bg-forge-alabaster/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-forge-black text-white">
                    OP {op.stepNumber}
                  </span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.2 border flex items-center gap-1 ${cfg.badge}`}>
                    <Icon className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>{cfg.label}</span>
                  </span>
                </div>

                <div className="font-sans font-semibold text-xs text-forge-black line-clamp-1" title={op.name}>
                  {op.name}
                </div>
                <div className="font-mono text-[10px] text-forge-steel truncate">
                  {op.machineType}
                </div>
              </div>

              {/* Time Metrics & Status */}
              <div className="mt-2 pt-1.5 border-t border-forge-aluminum/40 font-mono text-[9px] flex items-center justify-between text-forge-steel">
                <span>Plan: {op.plannedMinutes}m</span>
                <span className={`font-bold ${isOverrun ? 'text-rose-800' : 'text-forge-black'}`}>
                  Act: {op.actualMinutes > 0 ? `${op.actualMinutes}m` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
