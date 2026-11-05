import React from 'react';
import { Machine } from '../../types';

interface FleetDistributionBarProps {
  machines: Machine[];
  onFilterState?: (state: string) => void;
  selectedState?: string;
}

export const FleetDistributionBar: React.FC<FleetDistributionBarProps> = ({
  machines,
  onFilterState,
  selectedState = 'ALL'
}) => {
  const total = machines.length || 1;
  const running = machines.filter((m) => m.state === 'RUNNING').length;
  const setup = machines.filter((m) => m.state === 'SETUP').length;
  const idle = machines.filter((m) => m.state === 'IDLE').length;
  const stopped = machines.filter((m) => m.state === 'STOPPED').length;
  const alarm = machines.filter((m) => m.state === 'ALARM').length;

  const segments = [
    { id: 'RUNNING', label: 'RUNNING', count: running, color: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-500' },
    { id: 'SETUP', label: 'SETUP', count: setup, color: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-500' },
    { id: 'IDLE', label: 'IDLE', count: idle, color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-400' },
    { id: 'STOPPED', label: 'STOPPED', count: stopped, color: 'bg-slate-500', text: 'text-slate-700', border: 'border-slate-400' },
    { id: 'ALARM', label: 'ALARM', count: alarm, color: 'bg-rose-600', text: 'text-rose-700', border: 'border-rose-500' },
  ];

  return (
    <div className="bg-white border border-forge-aluminum p-3.5 space-y-2.5">
      <div className="flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-forge-black uppercase tracking-wider">
            FLEET STATE DISTRIBUTION
          </span>
          <span className="text-forge-steel text-[10px]">
            ({running}/{total} ACTIVE SPINDLES • {((running / total) * 100).toFixed(0)}% CUTTING)
          </span>
        </div>
        <div className="text-[10px] text-forge-steel tracking-widest uppercase">
          GROUNDED SHIFT 01 TELEMETRY
        </div>
      </div>

      {/* Multi-Segment Linear Bar */}
      <div className="h-4 bg-forge-alabaster border border-forge-aluminum flex overflow-hidden w-full">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          const isSelected = selectedState === seg.id;
          return (
            <div
              key={seg.id}
              onClick={() => onFilterState && onFilterState(isSelected ? 'ALL' : seg.id)}
              style={{ width: `${pct}%` }}
              className={`h-full ${seg.color} transition-all duration-300 relative group cursor-pointer hover:opacity-90 ${
                isSelected ? 'ring-2 ring-forge-black z-10' : ''
              }`}
              title={`${seg.label}: ${seg.count} spindles (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Count Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px]">
        {segments.map((seg) => {
          const pct = ((seg.count / total) * 100).toFixed(0);
          const isSelected = selectedState === seg.id;
          return (
            <button
              key={seg.id}
              onClick={() => onFilterState && onFilterState(isSelected ? 'ALL' : seg.id)}
              className={`flex items-center gap-1.5 px-2 py-0.5 border transition-all ${
                isSelected
                  ? 'border-forge-black bg-forge-alabaster font-bold'
                  : 'border-forge-aluminum/60 hover:border-forge-steel bg-white'
              }`}
            >
              <span className={`w-2 h-2 ${seg.color} rounded-none inline-block`} />
              <span className="text-forge-black">{seg.label}:</span>
              <span className="font-bold text-forge-black">{seg.count}</span>
              <span className="text-forge-steel text-[9px]">({pct}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
