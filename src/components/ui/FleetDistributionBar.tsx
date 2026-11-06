import React from 'react';
import { Machine } from '../../types';
import { getFleetStateAccounting } from '../../utils/telemetry';

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
  const acct = getFleetStateAccounting(machines);
  const total = acct.total || 1;

  const segments = [
    { id: 'RUNNING', label: 'RUNNING', count: acct.running, color: 'bg-emerald-600', text: 'text-emerald-800' },
    { id: 'SETUP', label: 'SETUP', count: acct.setup, color: 'bg-blue-600', text: 'text-blue-800' },
    { id: 'IDLE', label: 'IDLE', count: acct.idle, color: 'bg-amber-500', text: 'text-amber-800' },
    { id: 'STOPPED', label: 'STOPPED', count: acct.stopped, color: 'bg-slate-500', text: 'text-slate-800' },
    { id: 'ALARM', label: 'ALARM', count: acct.alarm, color: 'bg-rose-600', text: 'text-rose-800' },
    ...(acct.offline > 0 ? [{ id: 'OFFLINE', label: 'OFFLINE', count: acct.offline, color: 'bg-zinc-400', text: 'text-zinc-800' }] : []),
    ...(acct.unknown > 0 ? [{ id: 'UNKNOWN', label: 'UNCLASSIFIED', count: acct.unknown, color: 'bg-zinc-300', text: 'text-zinc-700' }] : [])
  ];

  const cuttingPct = ((acct.running / total) * 100).toFixed(0);

  return (
    <div className="bg-white border border-forge-aluminum p-3.5 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between font-mono text-[11px] gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-forge-black uppercase tracking-wider">
            FLEET STATE DISTRIBUTION
          </span>
          <span className="text-forge-steel text-[10px]">
            ({acct.running}/{total} ACTIVE SPINDLES • {cuttingPct}% CUTTING)
          </span>
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold uppercase">
            {acct.reconciled ? `${total}/${total} RECONCILED` : `${acct.unaccounted} UNACCOUNTED`}
          </span>
        </div>
        <div className="text-[10px] text-forge-steel tracking-widest uppercase">
          STANDARDIZED SHIFT 01 TELEMETRY • MUTUALLY EXCLUSIVE
        </div>
      </div>

      {/* Multi-Segment Linear Bar */}
      <div 
        role="region"
        aria-label="Spindle fleet state distribution chart"
        className="h-4 bg-forge-alabaster border border-forge-aluminum flex overflow-hidden w-full"
      >
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          const isSelected = selectedState === seg.id;
          return (
            <button
              type="button"
              key={seg.id}
              onClick={() => onFilterState && onFilterState(isSelected ? 'ALL' : seg.id)}
              style={{ width: `${pct}%` }}
              aria-label={`Filter by ${seg.label}: ${seg.count} spindles (${pct.toFixed(0)}%)`}
              aria-pressed={isSelected}
              className={`h-full ${seg.color} transition-all duration-300 relative group cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                isSelected ? 'ring-2 ring-forge-black z-10' : ''
              }`}
              title={`${seg.label}: ${seg.count} spindles (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Count Tags */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 font-mono text-[10px]">
        <div className="flex flex-wrap items-center gap-1.5">
          {segments.map((seg) => {
            const pct = ((seg.count / total) * 100).toFixed(0);
            const isSelected = selectedState === seg.id;
            return (
              <button
                type="button"
                key={seg.id}
                onClick={() => onFilterState && onFilterState(isSelected ? 'ALL' : seg.id)}
                aria-pressed={isSelected}
                aria-label={`Show ${seg.label} machines (${seg.count})`}
                className={`flex items-center gap-1.5 px-2 py-0.5 border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  isSelected
                    ? 'bg-forge-black text-white border-forge-black font-bold shadow-flat'
                    : 'bg-forge-alabaster border-forge-aluminum/70 text-forge-black hover:border-forge-steel'
                }`}
              >
                <span className={`w-2 h-2 ${seg.color}`} aria-hidden="true" />
                <span className="font-semibold uppercase text-[9px]">{seg.label}:</span>
                <span className="font-bold">{seg.count}</span>
                <span className={`text-[8px] ${isSelected ? 'text-zinc-300' : 'text-forge-steel'}`}>
                  ({pct}%)
                </span>
              </button>
            );
          })}
        </div>

        {selectedState !== 'ALL' && (
          <button
            type="button"
            onClick={() => onFilterState && onFilterState('ALL')}
            className="text-[9px] text-forge-orange hover:underline font-bold px-1.5 py-0.5 border border-forge-orange/40 bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            RESET FILTER
          </button>
        )}
      </div>
    </div>
  );
};
