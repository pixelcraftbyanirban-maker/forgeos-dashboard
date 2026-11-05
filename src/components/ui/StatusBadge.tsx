import React from 'react';
import { MachineState, ProductionState, ConnectionState } from '../../types';

interface StatusBadgeProps {
  type: 'machine' | 'production' | 'connection';
  status: MachineState | ProductionState | ConnectionState;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  showIcon = true,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  if (type === 'machine') {
    const s = status as MachineState;
    switch (s) {
      case 'RUNNING':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />}
            RUNNING
          </span>
        );
      case 'SETUP':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-blue-50 text-blue-900 border border-blue-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />}
            SETUP
          </span>
        );
      case 'IDLE':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-amber-50 text-amber-950 border border-amber-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />}
            IDLE
          </span>
        );
      case 'STOPPED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-slate-100 text-slate-800 border border-slate-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-600" aria-hidden="true" />}
            STOPPED
          </span>
        );
      case 'ALARM':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider bg-rose-50 text-rose-950 border border-rose-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" aria-hidden="true" />}
            ALARM
          </span>
        );
    }
  }

  if (type === 'production') {
    const s = status as ProductionState;
    switch (s) {
      case 'IN_PROGRESS':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-orange-50 text-amber-950 border border-forge-orange/60 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-forge-orange" aria-hidden="true" />}
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-emerald-600" aria-hidden="true" />}
            COMPLETED
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-amber-50 text-amber-950 border border-amber-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-amber-600" aria-hidden="true" />}
            ON HOLD
          </span>
        );
      case 'NOT_STARTED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-slate-100 text-slate-800 border border-slate-400 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-slate-500" aria-hidden="true" />}
            QUEUED
          </span>
        );
    }
  }

  if (type === 'connection') {
    const s = status as ConnectionState;
    switch (s) {
      case 'CURRENT':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 font-semibold">
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />}
            CURRENT (5s)
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-800 font-semibold">
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />}
            DELAYED (&gt;15s)
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-800 font-semibold">
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />}
            OFFLINE
          </span>
        );
      case 'INCOMPLETE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700">
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />}
            DATA GAP
          </span>
        );
    }
  }

  return null;
};
