import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { MachineFleetGrid } from '../../components/tables/MachineFleetGrid';
import { Machine } from '../../types';
import { LayoutGrid, List, Search, Cpu } from 'lucide-react';

interface MachinesPageProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({
  machines,
  onSelectMachine
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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

      {/* 2. Machine Fleet Main Container */}
      <ChamferCard
        title="SPINDLE FLEET DIRECTORY & TELEMETRY FEEDS"
        tag="12 SPINDLES"
        action={
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-forge-aluminum bg-white">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-forge-black text-white'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Density Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-forge-black text-white'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-forge-aluminum/60 pb-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by Spindle (e.g. CNC-01), Model, Operator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'ALL', label: 'ALL SPINDLES' },
                { id: 'RUNNING', label: 'RUNNING' },
                { id: 'SETUP', label: 'SETUP' },
                { id: 'IDLE', label: 'IDLE' },
                { id: 'ALARM', label: 'ALARM' },
                { id: 'STOPPED', label: 'STOPPED' }
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

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-forge-aluminum text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/50">
                    <th className="py-2.5 px-3 font-semibold">Spindle ID</th>
                    <th className="py-2.5 px-3 font-semibold">Machine Model</th>
                    <th className="py-2.5 px-3 font-semibold text-center">State</th>
                    <th className="py-2.5 px-3 font-semibold">Active Work Order</th>
                    <th className="py-2.5 px-3 font-semibold">Operator</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Spindle RPM</th>
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
          ) : (
            /* Grid View */
            <MachineFleetGrid
              machines={filteredMachines}
              onSelectMachine={onSelectMachine}
            />
          )}
        </div>
      </ChamferCard>
    </div>
  );
};
