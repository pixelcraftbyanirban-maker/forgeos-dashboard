import React, { useState } from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ShiftTimeline } from '../ui/ShiftTimeline';
import { LinearGauge } from '../ui/GaugeIndicator';
import { Machine } from '../../types';
import { User, ArrowRight } from 'lucide-react';

interface MachineFleetGridProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
  externalFilterState?: string;
  onFilterStateChange?: (state: string) => void;
}

export const MachineFleetGrid: React.FC<MachineFleetGridProps> = ({
  machines,
  onSelectMachine,
  externalFilterState,
  onFilterStateChange
}) => {
  const [internalFilterState, setInternalFilterState] = useState<string>('ALL');
  const activeFilter = externalFilterState !== undefined ? externalFilterState : internalFilterState;

  const handleFilter = (state: string) => {
    if (onFilterStateChange) {
      onFilterStateChange(state);
    } else {
      setInternalFilterState(state);
    }
  };

  const filteredMachines = machines.filter((m) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ATTENTION') return m.state === 'ALARM' || m.state === 'STOPPED';
    return m.state === activeFilter;
  });

  const stateCounts = {
    all: machines.length,
    running: machines.filter((m) => m.state === 'RUNNING').length,
    setup: machines.filter((m) => m.state === 'SETUP').length,
    idle: machines.filter((m) => m.state === 'IDLE').length,
    attention: machines.filter((m) => m.state === 'ALARM' || m.state === 'STOPPED').length,
  };

  return (
    <ChamferCard
      title="SPINDLE FLEET & REAL-TIME TELEMETRY"
      tag={`${machines.length} SPINDLES • HOWRAH CELL`}
      action={
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'ALL', label: `ALL (${stateCounts.all})` },
            { id: 'RUNNING', label: `RUNNING (${stateCounts.running})` },
            { id: 'SETUP', label: `SETUP (${stateCounts.setup})` },
            { id: 'IDLE', label: `IDLE (${stateCounts.idle})` },
            { id: 'ATTENTION', label: `ALARM / STOP (${stateCounts.attention})` },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleFilter(tab.id)}
              aria-pressed={activeFilter === tab.id}
              aria-label={`Filter fleet by ${tab.label}`}
              className={`px-2 py-1 text-[10px] font-mono tracking-wider transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                activeFilter === tab.id
                  ? 'bg-forge-black text-white border-forge-black font-semibold'
                  : 'bg-white text-forge-steel border-forge-aluminum hover:text-forge-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredMachines.map((machine) => {
          const isAlarm = machine.state === 'ALARM';
          const isStopped = machine.state === 'STOPPED';
          const cardBorder = isAlarm
            ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400'
            : isStopped
            ? 'border-slate-400 bg-slate-50/40'
            : machine.state === 'RUNNING'
            ? 'border-forge-aluminum hover:border-emerald-500 bg-white'
            : 'border-forge-aluminum bg-white';

          const maxRpm = machine.maxRpm || 20000;

          return (
            <div
              key={machine.id}
              role="button"
              tabIndex={0}
              aria-label={`Spindle ${machine.id}: ${machine.name}, state ${machine.state}, OEE ${machine.oee.overall}%`}
              onClick={() => onSelectMachine(machine.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectMachine(machine.id);
                }
              }}
              className={`border p-3.5 cursor-pointer transition-all hover:shadow-flat relative flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${cardBorder}`}
            >
              <div>
                {/* Header: Spindle ID, Axis & Machine State */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-forge-black">
                        {machine.id}
                      </span>
                      <span className="font-mono text-[9px] px-1 bg-forge-alabaster border border-forge-aluminum text-forge-steel">
                        {machine.axisCount}-AXIS
                      </span>
                    </div>
                    <span className="text-[11px] text-forge-steel font-sans truncate block max-w-[150px]" title={machine.name}>
                      {machine.name}
                    </span>
                  </div>
                  <StatusBadge type="machine" status={machine.state} size="sm" />
                </div>

                {/* Operator & Active Order */}
                <div className="text-[11px] font-mono space-y-1 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-forge-steel flex items-center gap-1">
                      <User className="w-3 h-3 text-forge-steel flex-shrink-0" aria-hidden="true" />
                      <span className="truncate max-w-[100px]">{machine.operator}</span>
                    </span>
                    <span className="text-[10px] text-forge-steel">
                      {machine.uptimeHoursToday}h uptime
                    </span>
                  </div>

                  <div className="p-1.5 bg-forge-alabaster border border-forge-aluminum/60 flex items-center justify-between">
                    <span className="text-[10px] text-forge-steel">ORDER:</span>
                    <span className="font-bold text-forge-black text-[10px] truncate max-w-[130px]">
                      {machine.currentJobId ? machine.currentJobId : '— IDLE / SETUP —'}
                    </span>
                  </div>
                </div>

                {/* 8-Hour State Timeline (Compact Shift View) */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex justify-between text-[9px] font-mono text-forge-steel">
                    <span>8H SHIFT TIMELINE</span>
                    <span className="font-bold text-forge-black">06:00 - 14:00</span>
                  </div>
                  <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                </div>

                {/* Real-time Spindle RPM Linear Gauge */}
                <div className="pt-2 border-t border-forge-aluminum/40">
                  <LinearGauge
                    label="SPINDLE ROTATION"
                    value={machine.spindleRpm}
                    max={maxRpm}
                    unit="RPM"
                    nominalTarget={12000}
                    color={machine.state === 'RUNNING' ? 'orange' : 'slate'}
                    showTicks={false}
                  />
                </div>
              </div>

              {/* Footer: OEE & Inspect Trigger */}
              <div className="pt-2.5 mt-2 border-t border-forge-aluminum/40 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[9px] text-forge-steel uppercase block">OEE</span>
                  <span className="font-bold text-forge-black text-sm">
                    {machine.oee.overall}%
                  </span>
                </div>

                <span className="text-forge-orange font-bold text-[11px] hover:underline flex items-center gap-0.5">
                  DETAILS <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ChamferCard>
  );
};
