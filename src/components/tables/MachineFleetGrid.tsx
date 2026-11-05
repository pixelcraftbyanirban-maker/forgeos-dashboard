import React, { useState } from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Machine } from '../../types';
import { Activity, User } from 'lucide-react';

interface MachineFleetGridProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
}

export const MachineFleetGrid: React.FC<MachineFleetGridProps> = ({
  machines,
  onSelectMachine
}) => {
  const [filterState, setFilterState] = useState<string>('ALL');

  const filteredMachines = machines.filter((m) => {
    if (filterState === 'ALL') return true;
    if (filterState === 'ATTENTION') return m.state === 'ALARM' || m.state === 'STOPPED';
    return m.state === filterState;
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
      title="SPINDLE FLEET & TELEMETRY"
      tag="12 SPINDLES"
      action={
        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: `ALL (${stateCounts.all})` },
            { id: 'RUNNING', label: `RUNNING (${stateCounts.running})` },
            { id: 'SETUP', label: `SETUP (${stateCounts.setup})` },
            { id: 'IDLE', label: `IDLE (${stateCounts.idle})` },
            { id: 'ATTENTION', label: `ALARM / STOP (${stateCounts.attention})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id)}
              className={`px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors border ${
                filterState === tab.id
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
          const cardBorder = isAlarm
            ? 'border-rose-400 bg-rose-50/30'
            : machine.state === 'RUNNING'
            ? 'border-forge-aluminum hover:border-emerald-400 bg-white'
            : 'border-forge-aluminum bg-white';

          return (
            <div
              key={machine.id}
              onClick={() => onSelectMachine(machine.id)}
              className={`border p-3 cursor-pointer transition-all hover:shadow-flat relative flex flex-col justify-between ${cardBorder}`}
            >
              <div>
                {/* Header: Spindle ID & Machine State */}
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
                    <span className="text-[11px] text-forge-steel font-sans truncate block max-w-[150px]">
                      {machine.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge type="machine" status={machine.state} size="sm" />
                    <StatusBadge type="connection" status={machine.connectionState} size="sm" showIcon={false} />
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-1 py-2 my-2 border-y border-forge-aluminum/40 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-forge-steel uppercase block">OEE</span>
                    <span className={`text-xs font-bold ${machine.oee.overall > 85 ? 'text-emerald-700' : 'text-forge-black'}`}>
                      {machine.oee.overall}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-forge-steel uppercase block">RPM</span>
                    <span className="text-xs font-semibold text-forge-black">
                      {machine.spindleRpm.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-forge-steel uppercase block">FEED</span>
                    <span className="text-xs font-semibold text-forge-black">
                      {machine.feedOverridePct}%
                    </span>
                  </div>
                </div>

                {/* Current Active Job or Idle Status */}
                <div className="text-[11px] font-mono space-y-0.5">
                  <div className="flex items-center gap-1 text-forge-steel truncate">
                    <Activity className="w-3 h-3 text-forge-orange flex-shrink-0" />
                    <span className="text-forge-black font-semibold">
                      {machine.currentJobId ? machine.currentJobId : 'NO ACTIVE JOB'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-forge-steel truncate text-[10px]">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span>OP: {machine.operator}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Telemetry Timestamp */}
              <div className="pt-2 mt-2 border-t border-forge-aluminum/30 flex items-center justify-between text-[9px] font-mono text-forge-steel">
                <span>UPTIME: {machine.uptimeHoursToday}h</span>
                <span>{machine.telemetryTimestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChamferCard>
  );
};
