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
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
            RUNNING
          </span>
        );
      case 'SETUP':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-blue-50 text-blue-800 border border-blue-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            SETUP
          </span>
        );
      case 'IDLE':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
            IDLE
          </span>
        );
      case 'STOPPED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-slate-100 text-slate-700 border border-slate-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
            STOPPED
          </span>
        );
      case 'ALARM':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider bg-rose-50 text-rose-800 border border-rose-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
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
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-orange-50 text-forge-orange border border-forge-orange/40 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-forge-orange" />}
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-emerald-600" />}
            COMPLETED
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-amber-600" />}
            ON HOLD
          </span>
        );
      case 'NOT_STARTED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider bg-slate-100 text-slate-600 border border-slate-300 ${padding}`}>
            {showIcon && <span className="w-1.5 h-1.5 bg-slate-400" />}
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
          <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            LIVE
          </span>
        );
      case 'DELAYED':
        return (
          <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-amber-700`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            DELAYED
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-rose-700`}>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            OFFLINE
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-slate-600`}>
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            {s}
          </span>
        );
    }
  }

  return null;
};
