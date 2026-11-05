import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { FleetDistributionBar } from '../../components/ui/FleetDistributionBar';
import { ShiftTimeline } from '../../components/ui/ShiftTimeline';
import { LinearGauge } from '../../components/ui/GaugeIndicator';
import { Machine } from '../../types';
import { LayoutGrid, List, Search, Cpu, Activity, User, ArrowRight } from 'lucide-react';

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
        tag="12 SPINDLES"
        action={
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-forge-aluminum bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Graphical Cards Grid"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>GRID</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono transition-colors ${
                  viewMode === 'table'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="High Density Table"
              >
                <List className="w-3 h-3" />
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
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Spindle ID, Model, Operator, Job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange"
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
                  key={tab.id}
                  onClick={() => setStateFilter(tab.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors border ${
                    stateFilter === tab.id
                      ? 'bg-forge-black text-white border-forge-black font-semibold'
                      : 'bg-white text-forge-steel border-forge-aluminum hover:text-forge-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <span className="text-forge-aluminum mx-1 hidden sm:inline">|</span>

              <select
                value={axisFilter}
                onChange={(e) => setAxisFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-white border border-forge-aluminum text-forge-black focus:outline-none"
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
                    onClick={() => onSelectMachine(machine.id)}
                    className={`border p-3.5 cursor-pointer transition-all hover:shadow-flat relative flex flex-col justify-between ${cardBorder}`}
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

                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge type="machine" status={machine.state} size="sm" />
                          <StatusBadge type="connection" status={machine.connectionState} size="sm" showIcon={false} />
                        </div>
                      </div>

                      {/* 8-Hour State Timeline */}
                      <div className="my-2 py-1.5 border-t border-forge-aluminum/40">
                        <div className="flex items-center justify-between text-[8px] font-mono text-forge-steel mb-1">
                          <span>8H SHIFT TIMELINE</span>
                          <span>UPTIME: {machine.uptimeHoursToday}h</span>
                        </div>
                        <ShiftTimeline intervals={machine.stateHistory} compact={true} />
                      </div>

                      {/* Live Telemetry Linear Gauges */}
                      <div className="space-y-1.5 py-1.5 border-t border-forge-aluminum/40">
                        <LinearGauge
                          label="SPINDLE SPEED"
                          value={machine.spindleRpm}
                          max={machine.maxRpm || 20000}
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

                      {/* OEE & Active Work Order */}
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
                          <span>OP: {machine.operator}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Timestamp & Inspection link */}
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
          ) : (
            /* High Density Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-forge-aluminum text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/50">
                    <th className="py-2.5 px-3 font-semibold">Spindle ID</th>
                    <th className="py-2.5 px-3 font-semibold">Machine Model</th>
                    <th className="py-2.5 px-3 font-semibold text-center">State</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[120px]">8h Shift State</th>
                    <th className="py-2.5 px-3 font-semibold">Active Order</th>
                    <th className="py-2.5 px-3 font-semibold">Operator</th>
                    <th className="py-2.5 px-3 font-semibold text-right">RPM</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Feed (mm/m)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Override</th>
                    <th className="py-2.5 px-3 font-semibold text-center">OEE</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Uptime</th>
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
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-forge-steel" />
                            <span>{machine.id}</span>
                          </div>
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
                            <span className="font-bold text-forge-orange">
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

                        <td className="py-3 px-3 text-right font-bold text-forge-black">
                          {machine.feedOverridePct}%
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-bold ${
                              machine.oee.overall > 85 ? 'text-emerald-700' : 'text-forge-black'
                            }`}
                          >
                            {machine.oee.overall}%
                          </span>
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
