import React, { useState } from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ShiftTimeline } from '../ui/ShiftTimeline';
import { LinearGauge } from '../ui/GaugeIndicator';
import { Machine } from '../../types';
import { evaluateTelemetryFreshness } from '../../utils/telemetry';
import { User, ArrowRight, AlertTriangle, Clock, Search } from 'lucide-react';

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
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [lowOeeOnly, setLowOeeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFilter = externalFilterState !== undefined ? externalFilterState : internalFilterState;

  const handleFilter = (state: string) => {
    if (onFilterStateChange) {
      onFilterStateChange(state);
    } else {
      setInternalFilterState(state);
    }
  };

  const stateCounts = {
    all: machines.length,
    running: machines.filter((m) => m.state === 'RUNNING').length,
    setup: machines.filter((m) => m.state === 'SETUP').length,
    idle: machines.filter((m) => m.state === 'IDLE').length,
    stopped: machines.filter((m) => m.state === 'STOPPED').length,
    alarm: machines.filter((m) => m.state === 'ALARM').length,
    attention: machines.filter((m) => m.state === 'ALARM' || m.state === 'STOPPED').length,
  };

  const filteredMachines = machines.filter((m) => {
    // 1. State filter
    if (activeFilter === 'ATTENTION') {
      if (m.state !== 'ALARM' && m.state !== 'STOPPED') return false;
    } else if (activeFilter !== 'ALL' && m.state !== activeFilter) {
      return false;
    }

    // 2. Section filter
    if (sectionFilter !== 'ALL' && m.section && !m.section.toLowerCase().includes(sectionFilter.toLowerCase())) {
      return false;
    }

    // 3. Low OEE filter (< 75%)
    if (lowOeeOnly && m.oee.overall >= 75) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = m.id.toLowerCase().includes(q);
      const matchName = m.name.toLowerCase().includes(q);
      const matchOp = m.operator.toLowerCase().includes(q);
      const matchJob = m.currentJobId ? m.currentJobId.toLowerCase().includes(q) : false;
      if (!matchId && !matchName && !matchOp && !matchJob) return false;
    }

    return true;
  });

  return (
    <ChamferCard
      title="SPINDLE FLEET & REAL-TIME TELEMETRY"
      tag={`${filteredMachines.length} of ${machines.length} SPINDLES DISPLAYED`}
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `ALL (${stateCounts.all})` },
            { id: 'RUNNING', label: `RUNNING (${stateCounts.running})` },
            { id: 'SETUP', label: `SETUP (${stateCounts.setup})` },
            { id: 'IDLE', label: `IDLE (${stateCounts.idle})` },
            { id: 'STOPPED', label: `STOPPED (${stateCounts.stopped})` },
            { id: 'ALARM', label: `ALARM (${stateCounts.alarm})` },
            { id: 'ATTENTION', label: `ATTENTION (${stateCounts.attention})` },
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
      <div className="space-y-3.5">
        {/* Secondary Filter & Search Control Toolbar */}
        <div className="p-2.5 bg-forge-alabaster border border-forge-aluminum/70 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Filter by ID, operator, job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter machines by spindle ID, operator, or work order"
                className="pl-7 pr-2.5 py-1 bg-white border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange w-48 sm:w-56"
              />
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-forge-steel">SECTION:</span>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                aria-label="Filter by machine section"
                className="bg-white border border-forge-aluminum px-2 py-1 text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange"
              >
                <option value="ALL">All Sections (3)</option>
                <option value="VMC">Section 1: VMC Center</option>
                <option value="Turning">Section 2: CNC Turning</option>
                <option value="HMC">Section 3: HMC & Heavy</option>
              </select>
            </div>

            {/* Low OEE toggle */}
            <button
              type="button"
              onClick={() => setLowOeeOnly(!lowOeeOnly)}
              aria-pressed={lowOeeOnly}
              className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                lowOeeOnly
                  ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
                  : 'bg-white text-forge-steel border-forge-aluminum hover:text-forge-black'
              }`}
            >
              LOW OEE (&lt; 75%)
            </button>
          </div>

          <div className="text-[10px] text-forge-steel">
            RECONCILED MUTUALLY EXCLUSIVE FLEET • {stateCounts.running} CUTTING
          </div>
        </div>

        {/* Machine Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMachines.map((machine) => {
            const isAlarm = machine.state === 'ALARM';
            const isStopped = machine.state === 'STOPPED';
            const cardBorder = isAlarm
              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
              : isStopped
              ? 'border-slate-400 bg-slate-50/40'
              : machine.state === 'RUNNING'
              ? 'border-forge-aluminum hover:border-emerald-500 bg-white'
              : 'border-forge-aluminum bg-white';

            const maxRpm = machine.maxRpm || 20000;
            const freshness = evaluateTelemetryFreshness(machine.telemetryAgeSeconds, machine.telemetryTimestamp);

            // Production progress calculation
            const partsCompleted = machine.partsCompleted || 0;
            const partsPlanned = machine.partsPlanned || 0;
            const progressPct = partsPlanned > 0 ? Math.round((partsCompleted / partsPlanned) * 100) : 0;

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
                  {/* Primary 1 & 2: Machine ID, Axis & Operational Status Badge */}
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

                  {/* Primary 3 & 4: Active Work Order & Assigned Operator */}
                  <div className="text-[11px] font-mono space-y-1 mb-2">
                    <div className="p-1.5 bg-forge-alabaster border border-forge-aluminum/60 flex items-center justify-between">
                      <span className="text-[10px] text-forge-steel uppercase font-semibold">ORDER:</span>
                      <span className="font-bold text-forge-black text-[10px] truncate max-w-[130px]">
                        {machine.currentJobId ? machine.currentJobId : '— IDLE / SETUP —'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-forge-steel flex items-center gap-1 truncate max-w-[120px]">
                        <User className="w-3 h-3 text-forge-steel flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{machine.operator}</span>
                      </span>
                      <span className="text-forge-steel font-semibold">
                        {machine.uptimeHoursToday}h uptime
                      </span>
                    </div>
                  </div>

                  {/* Primary 5: Production Progress Bar */}
                  {partsPlanned > 0 && (
                    <div className="space-y-1 mb-2.5 font-mono text-[10px]">
                      <div className="flex justify-between text-forge-steel">
                        <span>PROGRESS</span>
                        <span className="font-bold text-forge-black">
                          {partsCompleted}/{partsPlanned} pcs ({progressPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-forge-alabaster border border-forge-aluminum overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Secondary 6 & 7: Spindle RPM Gauge & Cycle Time Variance */}
                  <div className="pt-2 border-t border-forge-aluminum/40 space-y-2">
                    <LinearGauge
                      label="SPINDLE ROTATION"
                      value={machine.spindleRpm}
                      max={maxRpm}
                      unit="RPM"
                      nominalTarget={12000}
                      color={machine.state === 'RUNNING' ? 'emerald' : 'slate'}
                      showTicks={false}
                    />

                    {/* Cycle Time: Target vs Actual */}
                    {machine.targetCycleTimeSec && machine.targetCycleTimeSec > 0 ? (
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-forge-steel">CYCLE TIME:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-forge-steel">Tgt: {machine.targetCycleTimeSec}s</span>
                          <span className={`font-bold ${
                            machine.actualCycleTimeSec && machine.actualCycleTimeSec <= machine.targetCycleTimeSec
                              ? 'text-emerald-800'
                              : 'text-amber-900'
                          }`}>
                            Act: {machine.actualCycleTimeSec ? `${machine.actualCycleTimeSec}s` : '0s'}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 8-Hour State Timeline (Compact Shift View) */}
                  <div className="space-y-1 my-2.5">
                    <div className="flex justify-between text-[9px] font-mono text-forge-steel">
                      <span>8H SHIFT TIMELINE</span>
                      <span className="font-bold text-forge-black">06:00 - 14:00</span>
                    </div>
                    <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                  </div>

                  {/* Alert / Downtime / Freshness Information Bar */}
                  {machine.activeAlarm ? (
                    <div className="p-1.5 bg-rose-50 border border-rose-300 text-rose-950 font-mono text-[9px] flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate font-semibold">{machine.activeAlarm}</span>
                    </div>
                  ) : machine.maintenanceWarning ? (
                    <div className="p-1.5 bg-amber-50 border border-amber-300 text-amber-950 font-mono text-[9px] flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{machine.maintenanceWarning}</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer: OEE, Telemetry Freshness & Details Trigger */}
                <div className="pt-2 border-t border-forge-aluminum/40 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-forge-steel uppercase block">OEE</span>
                    <span className="font-bold text-forge-black text-sm">
                      {machine.oee.overall}%
                    </span>
                  </div>

                  {/* Telemetry freshness tag */}
                  <span className={`text-[9px] px-1.5 py-0.5 border font-semibold ${freshness.badgeBg} ${freshness.badgeText} ${freshness.badgeBorder}`}>
                    {freshness.freshness} • {freshness.ageText}
                  </span>

                  <span className="text-forge-orange font-bold text-[11px] hover:underline flex items-center gap-0.5">
                    DETAILS <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChamferCard>
  );
};
