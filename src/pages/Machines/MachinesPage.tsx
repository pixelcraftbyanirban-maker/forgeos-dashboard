import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { FleetDistributionBar } from '../../components/ui/FleetDistributionBar';
import { ShiftTimeline } from '../../components/ui/ShiftTimeline';
import { LinearGauge } from '../../components/ui/GaugeIndicator';
import { Machine } from '../../types';
import { LayoutGrid, List, Search, Cpu, User, ArrowRight } from 'lucide-react';

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

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.operator.toLowerCase().includes(search.toLowerCase()) ||
      (m.currentJobId && m.currentJobId.toLowerCase().includes(search.toLowerCase()));

    const matchesState = stateFilter === 'ALL' || m.state === stateFilter;
    const matchesAxis = axisFilter === 'ALL' || m.axisCount.toString() === axisFilter;

    return matchesSearch && matchesState && matchesAxis;
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
          subtext="Grounded shop floor calculation"
          trend={{ value: "Target: 85%", isPositive: true }}
          accentColor="orange"
          badge="GROUNDED"
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
          {/* Controls: Search, State & Axis Filters */}
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
                aria-label="Filter machines by axis count"
                value={axisFilter}
                onChange={(e) => setAxisFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-white border border-forge-aluminum text-forge-black focus:outline-none focus:border-forge-orange"
              >
                <option value="ALL">ALL AXIS TYPES</option>
                <option value="5">5-AXIS ONLY</option>
                <option value="4">4-AXIS ONLY</option>
                <option value="3">3-AXIS ONLY</option>
              </select>
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
                      {/* Machine Header */}
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

                      {/* Operator & Active Order */}
                      <div className="text-[11px] font-mono space-y-1 mb-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-forge-steel flex items-center gap-1">
                            <User className="w-3 h-3 text-forge-steel flex-shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[110px]">{machine.operator}</span>
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

                      {/* 8-Hour State Timeline */}
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
                          max={machine.maxRpm || 20000}
                          unit="RPM"
                          nominalTarget={12000}
                          color={machine.state === 'RUNNING' ? 'orange' : 'slate'}
                          showTicks={false}
                        />
                      </div>
                    </div>

                    {/* Card Footer: Timestamp & Inspection link */}
                    <div className="pt-2 mt-2 border-t border-forge-aluminum/30 flex items-center justify-between text-[9px] font-mono text-forge-steel">
                      <span>{machine.telemetryTimestamp}</span>
                      <span className="font-bold text-forge-black hover:text-forge-orange flex items-center gap-0.5">
                        TELEMETRY <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
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
                    <th scope="col" className="py-2.5 px-3 font-semibold">Operator</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">RPM</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">Feed (mm/m)</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">Override</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-center">OEE</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forge-aluminum/40">
                  {filteredMachines.map((machine) => {
                    const isAlarm = machine.state === 'ALARM';
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
                            {machine.axisCount}-Axis CNC Cell
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

                        <td className="py-3 px-3 text-forge-steel text-[11px]">
                          {machine.operator}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-forge-black">
                          {machine.spindleRpm.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right text-forge-steel">
                          {machine.feedRateMmpm.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className={`px-1 py-0.2 border font-bold text-[10px] ${
                            machine.feedOverridePct >= 95
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-amber-50 text-amber-950 border-amber-300'
                          }`}>
                            {machine.feedOverridePct}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-forge-black">
                          {machine.oee.overall}%
                        </td>

                        <td className="py-3 px-3 text-right text-forge-steel">
                          {machine.uptimeHoursToday}h
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
