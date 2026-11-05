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
  COMPLETED: { label: 'COMPLETED', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: Check },
  IN_PROGRESS: { label: 'ACTIVE', badge: 'bg-orange-50 text-orange-800 border-orange-400 font-bold animate-pulse', icon: Clock },
  ON_HOLD: { label: 'ON HOLD', badge: 'bg-amber-50 text-amber-800 border-amber-300', icon: AlertTriangle },
  NOT_STARTED: { label: 'QUEUED', badge: 'bg-slate-50 text-slate-600 border-slate-200', icon: Clock }
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
      <div className="flex items-center justify-between font-mono text-[10px] text-forge-steel">
        <span className="uppercase tracking-wider font-semibold text-forge-black">
          ROUTING PIPELINE ({operations.length} OPERATIONS)
        </span>
        <span>STEP SEQUENCE • PLANNED VS ACTUAL TIME</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {operations.map((op) => {
          const cfg = STATE_CONFIG[op.state] || STATE_CONFIG.NOT_STARTED;
          const Icon = cfg.icon;
          const isActive = op.state === 'IN_PROGRESS' || (currentOperationName && currentOperationName.includes(`Op ${op.stepNumber}`));
          const deltaMinutes = op.actualMinutes - op.plannedMinutes;
          const isOverrun = op.state === 'COMPLETED' && deltaMinutes > 0;

          return (
            <div
              key={op.id}
              onClick={() => onSelectOperation && onSelectOperation(op)}
              className={`p-2.5 border transition-all relative flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'border-forge-orange bg-forge-orange-light/40 shadow-flat ring-1 ring-forge-orange'
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
                    <Icon className="w-2.5 h-2.5" />
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

              {/* Planned vs Actual Cycle Time */}
              <div className="mt-2.5 pt-2 border-t border-forge-aluminum/40 font-mono text-[10px] flex items-center justify-between">
                <div>
                  <span className="text-forge-steel text-[9px]">PLAN: </span>
                  <span className="font-bold text-forge-black">{op.plannedMinutes}m</span>
                </div>
                <div>
                  <span className="text-forge-steel text-[9px]">ACT: </span>
                  <span className={`font-bold ${isOverrun ? 'text-rose-600' : 'text-forge-black'}`}>
                    {op.actualMinutes}m
                  </span>
                </div>
              </div>

              {/* Mini visual progress bar for step */}
              <div className="h-1 bg-forge-aluminum/40 mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    op.state === 'COMPLETED'
                      ? 'bg-emerald-600'
                      : op.state === 'IN_PROGRESS'
                      ? 'bg-forge-orange'
                      : 'bg-transparent'
                  }`}
                  style={{
                    width: op.state === 'COMPLETED' ? '100%' : op.state === 'IN_PROGRESS' ? '50%' : '0%'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
