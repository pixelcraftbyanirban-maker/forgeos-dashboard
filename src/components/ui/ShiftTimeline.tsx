import React from 'react';
import { MachineStateInterval, MachineState } from '../../types';

interface ShiftTimelineProps {
  intervals?: MachineStateInterval[];
  compact?: boolean;
  className?: string;
}

const STATE_COLORS: Record<MachineState, { bg: string; text: string }> = {
  RUNNING: { bg: 'bg-emerald-600', text: 'text-emerald-700' },
  SETUP: { bg: 'bg-blue-600', text: 'text-blue-700' },
  IDLE: { bg: 'bg-amber-500', text: 'text-amber-700' },
  STOPPED: { bg: 'bg-slate-500', text: 'text-slate-700' },
  ALARM: { bg: 'bg-rose-600', text: 'text-rose-700' },
  OFFLINE: { bg: 'bg-zinc-400', text: 'text-zinc-600' },
  UNKNOWN: { bg: 'bg-zinc-300', text: 'text-zinc-500' }
};

export const ShiftTimeline: React.FC<ShiftTimelineProps> = ({
  intervals = [],
  compact = false,
  className = ''
}) => {
  const totalShiftMinutes = 480; // 8 hours (06:00 to 14:00)

  // Default fallback if no history supplied
  const effectiveIntervals: MachineStateInterval[] = intervals.length > 0 ? intervals : [
    { startHour: "06:00", durationMinutes: 480, state: "RUNNING", reason: "Standard continuous production run" }
  ];

  const ariaDescription = effectiveIntervals
    .map(i => `${i.state} from ${i.startHour} for ${i.durationMinutes} minutes`)
    .join(', ');

  return (
    <div className={`space-y-1 ${className}`}>
      {!compact && (
        <div className="flex justify-between items-center font-mono text-[9px] text-forge-steel uppercase tracking-wider">
          <span>06:00</span>
          <span>08:00</span>
          <span>10:00</span>
          <span>12:00</span>
          <span>14:00 (NOW)</span>
        </div>
      )}

      {/* Main Timeline Bar */}
      <div 
        role="img"
        aria-label={`8-hour shift timeline: ${ariaDescription}`}
        className={`w-full bg-forge-alabaster border border-forge-aluminum flex overflow-hidden relative ${compact ? 'h-2.5' : 'h-4'}`}
      >
        {effectiveIntervals.map((interval, idx) => {
          const widthPct = (interval.durationMinutes / totalShiftMinutes) * 100;
          const styling = STATE_COLORS[interval.state] || { bg: 'bg-slate-400', text: 'text-slate-600' };

          return (
            <div
              key={idx}
              style={{ width: `${widthPct}%` }}
              className={`h-full ${styling.bg} border-r border-white/20 transition-all hover:opacity-85 relative group cursor-pointer`}
            >
              {/* Tooltip on Hover */}
              <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap bg-forge-black text-white font-mono text-[9px] px-2 py-1 shadow-elevated border border-forge-steel/60">
                <span className="font-bold text-forge-orange">[{interval.state}]</span> {interval.startHour} • {interval.durationMinutes}m
                {interval.reason && <span className="block text-zinc-300 text-[8px]">{interval.reason}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between font-mono text-[8px] text-forge-steel pt-0.5 gap-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 inline-block" aria-hidden="true" /> RUNNING
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-600 inline-block" aria-hidden="true" /> SETUP
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 inline-block" aria-hidden="true" /> IDLE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-slate-500 inline-block" aria-hidden="true" /> STOPPED
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-600 inline-block" aria-hidden="true" /> ALARM
          </span>
        </div>
      )}
    </div>
  );
};
