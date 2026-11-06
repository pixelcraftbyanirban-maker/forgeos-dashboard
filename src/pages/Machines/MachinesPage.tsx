import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { FleetDistributionBar } from '../../components/ui/FleetDistributionBar';
import { ShiftTimeline } from '../../components/ui/ShiftTimeline';
import { LinearGauge } from '../../components/ui/GaugeIndicator';
import { Machine } from '../../types';
import { evaluateTelemetryFreshness } from '../../utils/telemetry';
import { LayoutGrid, List, Search, Cpu, User, ArrowRight, AlertTriangle, Clock } from 'lucide-react';

interface MachinesPageProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({
  machines,
  onSelectMachine
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [axisFilter, setAxisFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [lowOeeOnly, setLowOeeOnly] = useState<boolean>(false);

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.operator.toLowerCase().includes(search.toLowerCase()) ||
      (m.currentJobId && m.currentJobId.toLowerCase().includes(search.toLowerCase()));

    const matchesState = stateFilter === 'ALL' || m.state === stateFilter;
    const matchesAxis = axisFilter === 'ALL' || m.axisCount.toString() === axisFilter;
    const matchesSection = sectionFilter === 'ALL' || (m.section && m.section.toLowerCase().includes(sectionFilter.toLowerCase()));
    const matchesLowOee = !lowOeeOnly || m.oee.overall < 75;

    return matchesSearch && matchesState && matchesAxis && matchesSection && matchesLowOee;
  });

  const runningCount = machines.filter((m) => m.state === 'RUNNING').length;
  const avgOee = (
    machines.reduce((sum, m) => sum + m.oee.overall, 0) / machines.length
  ).toFixed(1);
  const totalUptimeHours = machines
    .reduce((sum, m) => sum + m.uptimeHoursToday, 0)
    .toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. Fleet Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="FLEET RUNNING STATUS"
          value={`${runningCount} / ${machines.length}`}
          unit="SPINDLES"
          subtext="Active cutting metal"
          accentColor="emerald"
          badge="LIVE"
        />

        <MetricCard
          category="FLEET AVERAGE OEE"
          value={`${avgOee}%`}
          subtext="Standard OEE (A × P × Q)"
          trend={{ value: "Target: 85%", isPositive: true }}
          accentColor="emerald"
          badge="ISO 22400"
        />

        <MetricCard
          category="TOTAL SPINDLE RUNTIME"
          value={`${totalUptimeHours}h`}
          subtext="Cumulative shift spindle uptime"
          accentColor="black"
          badge="SHIFT 01"
        />

        <MetricCard
          category="TELEMETRY PROTOCOL"
          value="MTConnect"
          unit="v2.0"
          subtext="High-frequency 5s polling stream"
          accentColor="orange"
          badge="SECURE STREAM"
        />
      </div>

      {/* 2. Graphical Fleet State Distribution Bar */}
      <FleetDistributionBar
        machines={machines}
        selectedState={stateFilter}
        onFilterState={setStateFilter}
      />

      {/* 3. Machine Fleet Main Container */}
      <ChamferCard
        title="SPINDLE FLEET DIRECTORY & TELEMETRY FEEDS"
        tag={`${machines.length} SPINDLES • 3 SECTIONS`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-forge-aluminum bg-white" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label="Grid view"
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  viewMode === 'grid'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Graphical Cards Grid"
              >
                <LayoutGrid className="w-3 h-3" aria-hidden="true" />
                <span>GRID</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
                aria-label="Table view"
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  viewMode === 'table'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="High Density Table"
              >
                <List className="w-3 h-3" aria-hidden="true" />
                <span>TABLE</span>
              </button>
            </div>
            <span className="font-mono text-[10px] text-forge-steel hidden sm:inline">
              SHOWING {filteredMachines.length} OF {machines.length}
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Controls: Search, State, Section & Axis Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-forge-aluminum/60 pb-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                aria-label="Search Spindle ID, Model, Operator, or Job"
                placeholder="Search Spindle ID, Model, Operator, Job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/70 focus:outline-none focus:border-forge-orange focus:bg-white"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'ALL', label: 'ALL STATES' },
                { id: 'RUNNING', label: 'RUNNING' },
                { id: 'SETUP', label: 'SETUP' },
                { id: 'IDLE', label: 'IDLE' },
                { id: 'STOPPED', label: 'STOPPED' },
                { id: 'ALARM', label: 'ALARM' }
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setStateFilter(tab.id)}
                  aria-pressed={stateFilter === tab.id}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                    stateFilter === tab.id
                      ? 'bg-forge-black text-white border-forge-black font-semibold'
                      : 'bg-white text-forge-steel border-forge-aluminum hover:text-forge-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <span className="text-forge-aluminum mx-1 hidden sm:inline" aria-hidden="true">|</span>

              <select
                aria-label="Filter machines by section"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-white border border-forge-aluminum text-forge-black focus:outline-none focus:border-forge-orange"
              >
                <option value="ALL">ALL SECTIONS</option>
                <option value="VMC">VMC CENTER</option>
                <option value="Turning">CNC TURNING</option>
                <option value="HMC">HMC & HEAVY</option>
              </select>

              <select
                aria-label="Filter machines by axis count"
                value={axisFilter}
                onChange={(e) => setAxisFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-white border border-forge-aluminum text-forge-black focus:outline-none focus:border-forge-orange"
              >
                <option value="ALL">ALL AXIS</option>
                <option value="5">5-AXIS</option>
                <option value="4">4-AXIS</option>
                <option value="3">3-AXIS</option>
              </select>

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
                LOW OEE
              </button>
            </div>
          </div>

          {/* Graphical View Mode Switch */}
          {viewMode === 'grid' ? (
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
                const freshness = evaluateTelemetryFreshness(machine.telemetryAgeSeconds, machine.telemetryTimestamp);
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
                      {/* Primary 1 & 2: Machine Header & Operational Status Badge */}
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
                        <StatusBadge type="machine" status={machine.state} size="sm" />
                      </div>

                      {/* Primary 3 & 4: Operator & Active Work Order */}
                      <div className="text-[11px] font-mono space-y-1 mb-2.5">
                        <div className="p-1.5 bg-forge-alabaster border border-forge-aluminum/60 flex items-center justify-between">
                          <span className="text-[10px] text-forge-steel font-semibold uppercase">ORDER:</span>
                          <span className="font-bold text-forge-black text-[10px] truncate max-w-[130px]">
                            {machine.currentJobId ? machine.currentJobId : '— IDLE / SETUP —'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-forge-steel flex items-center gap-1">
                            <User className="w-3 h-3 text-forge-steel flex-shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[110px]">{machine.operator}</span>
                          </span>
                          <span className="text-forge-steel font-semibold">
                            {machine.uptimeHoursToday}h uptime
                          </span>
                        </div>
                      </div>

                      {/* Primary 5: Production Progress */}
                      {partsPlanned > 0 && (
                        <div className="space-y-1 mb-2 font-mono text-[10px]">
                          <div className="flex justify-between text-forge-steel">
                            <span>BATCH PROGRESS</span>
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

                      {/* Secondary 6 & 7: RPM Gauge & Cycle Time Variance */}
                      <div className="pt-2 border-t border-forge-aluminum/40 space-y-1.5">
                        <LinearGauge
                          label="SPINDLE ROTATION"
                          value={machine.spindleRpm}
                          max={maxRpm}
                          unit="RPM"
                          nominalTarget={12000}
                          color={machine.state === 'RUNNING' ? 'emerald' : 'slate'}
                          showTicks={false}
                        />

                        {machine.targetCycleTimeSec && machine.targetCycleTimeSec > 0 ? (
                          <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                            <span className="text-forge-steel">CYCLE TIME:</span>
                            <span className="font-bold text-forge-black">
                              {machine.actualCycleTimeSec ? `${machine.actualCycleTimeSec}s` : '0s'} <span className="text-forge-steel font-normal">/ {machine.targetCycleTimeSec}s tgt</span>
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* 8-Hour State Timeline */}
                      <div className="space-y-1 my-2.5">
                        <div className="flex justify-between text-[9px] font-mono text-forge-steel">
                          <span>8H SHIFT TIMELINE</span>
                          <span className="font-bold text-forge-black">06:00 - 14:00</span>
                        </div>
                        <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                      </div>

                      {/* Alert / Warning Banner if active */}
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

                    {/* Card Footer: OEE, Telemetry Freshness & Inspection link */}
                    <div className="pt-2 mt-2 border-t border-forge-aluminum/30 flex items-center justify-between text-[10px] font-mono">
                      <div>
                        <span className="text-[9px] text-forge-steel uppercase block">OEE</span>
                        <span className="font-bold text-forge-black text-xs">{machine.oee.overall}%</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 border font-semibold ${freshness.badgeBg} ${freshness.badgeText} ${freshness.badgeBorder}`}>
                        {freshness.freshness} • {freshness.ageText}
                      </span>
                      <span className="font-bold text-forge-orange hover:underline flex items-center gap-0.5">
                        INSPECT <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* High Density Table View */
            <div 
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
              tabIndex={0}
              role="region"
              aria-label="Spindle fleet telemetry data table (scrollable horizontally)"
            >
              <table className="w-full text-left font-mono text-xs min-w-[880px]">
                <thead>
                  <tr className="border-b border-forge-aluminum text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/50">
                    <th scope="col" className="py-2.5 px-3 font-semibold">Spindle ID</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Machine Model</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-center">State</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold min-w-[120px]">8h Shift State</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Active Order</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Progress</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Operator</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">RPM</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">Cycle (Act/Tgt)</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-center">OEE</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">Freshness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forge-aluminum/40">
                  {filteredMachines.map((machine) => {
                    const isAlarm = machine.state === 'ALARM';
                    const freshness = evaluateTelemetryFreshness(machine.telemetryAgeSeconds, machine.telemetryTimestamp);
                    const partsCompleted = machine.partsCompleted || 0;
                    const partsPlanned = machine.partsPlanned || 0;
                    const progressPct = partsPlanned > 0 ? Math.round((partsCompleted / partsPlanned) * 100) : 0;

                    return (
                      <tr
                        key={machine.id}
                        onClick={() => onSelectMachine(machine.id)}
                        className={`hover:bg-forge-alabaster/70 transition-colors cursor-pointer ${
                          isAlarm ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-forge-black">
                          <button
                            type="button"
                            onClick={() => onSelectMachine(machine.id)}
                            className="flex items-center gap-1.5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange text-left"
                          >
                            <Cpu className="w-3.5 h-3.5 text-forge-steel flex-shrink-0" aria-hidden="true" />
                            <span>{machine.id}</span>
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-forge-black block">
                            {machine.name}
                          </span>
                          <span className="text-[10px] text-forge-steel">
                            {machine.axisCount}-Axis • {machine.section || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <StatusBadge type="machine" status={machine.state} size="sm" />
                        </td>

                        <td className="py-3 px-3 min-w-[120px]">
                          <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                        </td>

                        <td className="py-3 px-3">
                          {machine.currentJobId ? (
                            <span className="font-bold text-amber-950 bg-amber-50 px-1 py-0.2 border border-amber-300">
                              {machine.currentJobId}
                            </span>
                          ) : (
                            <span className="text-forge-steel text-[11px]">
                              — Idle (No Job) —
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-forge-black text-[11px]">
                          {partsPlanned > 0 ? `${partsCompleted}/${partsPlanned} (${progressPct}%)` : '—'}
                        </td>

                        <td className="py-3 px-3 text-forge-steel text-[11px]">
                          {machine.operator}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-forge-black">
                          {machine.spindleRpm.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right text-forge-black text-[11px]">
                          {machine.actualCycleTimeSec ? `${machine.actualCycleTimeSec}s` : '0s'} / {machine.targetCycleTimeSec ? `${machine.targetCycleTimeSec}s` : '—'}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-forge-black">
                          {machine.oee.overall}%
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className={`text-[9px] px-1.5 py-0.2 border font-semibold ${freshness.badgeBg} ${freshness.badgeText} ${freshness.badgeBorder}`}>
                            {freshness.freshness}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ChamferCard>
    </div>
  );
};
