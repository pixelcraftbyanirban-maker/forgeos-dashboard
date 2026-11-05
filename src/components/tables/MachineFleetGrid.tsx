import React, { useState } from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ShiftTimeline } from '../ui/ShiftTimeline';
import { LinearGauge } from '../ui/GaugeIndicator';
import { Machine } from '../../types';
import { Activity, User, ArrowRight } from 'lucide-react';

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
              key={tab.id}
              onClick={() => handleFilter(tab.id)}
              className={`px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors border ${
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
              onClick={() => onSelectMachine(machine.id)}
              className={`border p-3.5 cursor-pointer transition-all hover:shadow-flat relative flex flex-col justify-between ${cardBorder}`}
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
                    <span className="text-[11px] text-forge-steel font-sans truncate block max-w-[160px]" title={machine.name}>
                      {machine.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge type="machine" status={machine.state} size="sm" />
                    <StatusBadge type="connection" status={machine.connectionState} size="sm" showIcon={false} />
                  </div>
                </div>

                {/* 8-Hour State Timeline (Compact Visual) */}
                <div className="my-2 py-1.5 border-t border-forge-aluminum/40">
                  <div className="flex items-center justify-between text-[8px] font-mono text-forge-steel mb-1">
                    <span>8H SHIFT HISTORY</span>
                    <span>{machine.uptimeHoursToday}h UPTIME</span>
                  </div>
                  <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                </div>

                {/* Live Telemetry Linear Gauges */}
                <div className="space-y-1.5 py-1.5 border-t border-forge-aluminum/40">
                  <LinearGauge
                    label="SPINDLE SPEED"
                    value={machine.spindleRpm}
                    max={maxRpm}
                    unit="RPM"
                    color={machine.state === 'RUNNING' ? 'orange' : 'slate'}
                    showTicks={false}
                  />

                  <LinearGauge
                    label="FEED OVERRIDE"
                    value={machine.feedOverridePct}
                    max={120}
                    unit="%"
                    nominalTarget={100}
                    color={machine.feedOverridePct >= 95 ? 'emerald' : 'orange'}
                    showTicks={false}
                  />
                </div>

                {/* OEE & Current Active Job */}
                <div className="pt-2 border-t border-forge-aluminum/40 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-forge-steel text-[10px]">GROUNDED OEE:</span>
                    <span className={`font-bold ${machine.oee.overall >= 85 ? 'text-emerald-700' : 'text-forge-black'}`}>
                      {machine.oee.overall}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-forge-steel truncate text-[10px]">
                    <Activity className="w-3 h-3 text-forge-orange flex-shrink-0" />
                    <span className="text-forge-black font-semibold truncate">
                      {machine.currentJobId ? machine.currentJobId : 'NO ACTIVE WORK ORDER'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-forge-steel truncate text-[9px]">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span>OPERATOR: {machine.operator}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Timestamp & Drilldown */}
              <div className="pt-2 mt-2 border-t border-forge-aluminum/30 flex items-center justify-between text-[9px] font-mono text-forge-steel">
                <span>{machine.telemetryTimestamp}</span>
                <span className="font-bold text-forge-black hover:text-forge-orange flex items-center gap-0.5">
                  TELEMETRY <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ChamferCard>
  );
};
