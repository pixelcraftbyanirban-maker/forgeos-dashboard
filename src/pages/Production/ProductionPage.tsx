import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { OperationFlowBar } from '../../components/ui/OperationFlowBar';
import { Job, JobPriority } from '../../types';
import { Search, ChevronDown, ChevronRight, Clock, ArrowUpDown, List, Layers, ArrowRight } from 'lucide-react';

interface ProductionPageProps {
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
}

export const ProductionPage: React.FC<ProductionPageProps> = ({
  jobs,
  onSelectJob
}) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'order' | 'completion'>('priority');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.partName.toLowerCase().includes(search.toLowerCase()) ||
      job.material.toLowerCase().includes(search.toLowerCase()) ||
      (job.customerCode && job.customerCode.toLowerCase().includes(search.toLowerCase())) ||
      job.targetMachineId.toLowerCase().includes(search.toLowerCase());

    const matchesState = stateFilter === 'ALL' || job.state === stateFilter;
    const matchesPriority = priorityFilter === 'ALL' || job.priority === priorityFilter;

    return matchesSearch && matchesState && matchesPriority;
  });

  // Sort jobs
  const priorityWeight: Record<JobPriority, number> = {
    URGENT: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1
  };

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'priority') {
      comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
    } else if (sortBy === 'progress') {
      comparison = b.progressPercent - a.progressPercent;
    } else if (sortBy === 'order') {
      comparison = a.orderNumber.localeCompare(b.orderNumber);
    } else if (sortBy === 'completion') {
      comparison = a.estCompletion.localeCompare(b.estCompletion);
    }
    return sortAsc ? -comparison : comparison;
  });

  const totalTargetUnits = jobs.reduce((sum, j) => sum + j.quantityTarget, 0);
  const totalCompletedUnits = jobs.reduce((sum, j) => sum + j.quantityCompleted, 0);
  const totalScrappedUnits = jobs.reduce((sum, j) => sum + j.quantityScrapped, 0);
  const scrapRatePct = ((totalScrappedUnits / (totalCompletedUnits + totalScrappedUnits || 1)) * 100).toFixed(1);

  const toggleSort = (type: typeof sortBy) => {
    if (sortBy === type) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(type);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Production Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="PRODUCTION VOLUME"
          value={totalCompletedUnits}
          unit={`/ ${totalTargetUnits} UNITS`}
          subtext="Total shift parts produced"
          accentColor="orange"
          badge="SHIFT 01"
        />

        <MetricCard
          category="SCHEDULE ADHERENCE"
          value="94.2%"
          subtext="1 delayed • 9 on track"
          trend={{ value: "Target: 95%", isPositive: true }}
          accentColor="emerald"
          badge="HMLV"
        />

        <MetricCard
          category="QUALITY SCRAP RATE"
          value={`${scrapRatePct}%`}
          unit={`(${totalScrappedUnits} SCRAPPED)`}
          subtext="Strict tolerance verification"
          trend={{ value: "Max Limit: 1.5%", isPositive: true }}
          accentColor="black"
          badge="QA VERIFIED"
        />

        <MetricCard
          category="ACTIVE WORK ORDERS"
          value={jobs.length}
          subtext="8 In Progress • 1 Queued • 1 On Hold"
          accentColor="orange"
          badge="ROUTING"
        />
      </div>

      {/* 2. Main Production Routing Card */}
      <ChamferCard
        title="MANUFACTURING WORK ORDERS & OPERATION PROCESS FLOW"
        tag="HMLV SHOP FLOOR"
        action={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-forge-aluminum bg-white">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono transition-colors ${
                  viewMode === 'pipeline'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Graphical Pipeline Process Flow"
              >
                <Layers className="w-3 h-3" />
                <span>PIPELINE</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono transition-colors ${
                  viewMode === 'table'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
                title="Dense Data Table"
              >
                <List className="w-3 h-3" />
                <span>TABLE</span>
              </button>
            </div>
            <div className="font-mono text-[10px] text-forge-steel hidden sm:inline">
              SHOWING {sortedJobs.length} OF {jobs.length} ORDERS
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Controls: Search, Filters & Sorting */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-forge-aluminum/60 pb-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by Order, Part, Material, Spindle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange"
              />
            </div>

            {/* State Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'ALL', label: 'ALL' },
                { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
                { id: 'ON_HOLD', label: 'ON HOLD' },
                { id: 'NOT_STARTED', label: 'QUEUED' }
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

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-white border border-forge-aluminum text-forge-black focus:outline-none"
              >
                <option value="ALL">ALL PRIORITIES</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
              </select>
            </div>
          </div>

          {/* Graphical Pipeline View (Section 07.B) */}
          {viewMode === 'pipeline' ? (
            <div className="space-y-4">
              {sortedJobs.map((job) => {
                const isDelayed = job.state === 'ON_HOLD';

                return (
                  <div
                    key={job.id}
                    className={`border p-4 transition-all bg-white relative space-y-3 ${
                      isDelayed
                        ? 'border-amber-400 bg-amber-50/20 shadow-flat'
                        : 'border-forge-aluminum hover:border-forge-steel'
                    }`}
                  >
                    {/* Job Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forge-aluminum/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-forge-black">
                          {job.orderNumber}
                        </span>
                        {job.priority === 'URGENT' && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-300 font-bold font-mono">
                            URGENT
                          </span>
                        )}
                        {job.priority === 'HIGH' && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 font-semibold font-mono">
                            HIGH
                          </span>
                        )}
                        <span className="font-display font-bold text-sm text-forge-black">
                          {job.partName}
                        </span>
                        <span className="text-forge-steel text-[11px] font-mono hidden md:inline">
                          ({job.partNumber})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-forge-steel">
                          SPINDLE: <strong className="text-forge-black">{job.targetMachineId}</strong>
                        </span>
                        <StatusBadge type="production" status={job.state} size="sm" />
                        <button
                          onClick={() => onSelectJob(job.id)}
                          className="font-mono text-[10px] text-forge-orange hover:underline font-bold flex items-center gap-1"
                        >
                          INSPECT <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Operational Details Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] p-2 bg-forge-alabaster border border-forge-aluminum/50">
                      <div>
                        <span className="text-forge-steel text-[9px] block">MATERIAL / ALLOY</span>
                        <span className="font-semibold text-forge-black">{job.material}</span>
                      </div>
                      <div>
                        <span className="text-forge-steel text-[9px] block">QUANTITY PROGRESS</span>
                        <span className="font-bold text-forge-black">
                          {job.quantityCompleted} / {job.quantityTarget} Units
                        </span>
                        {job.quantityScrapped > 0 && (
                          <span className="text-rose-600 text-[10px] ml-1">
                            ({job.quantityScrapped} scrap)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-forge-steel text-[9px] block">CURRENT ACTIVE OP</span>
                        <span className="font-semibold text-forge-orange truncate block">
                          {job.currentOperation}
                        </span>
                      </div>
                      <div>
                        <span className="text-forge-steel text-[9px] block">EST. COMPLETION</span>
                        <span className="font-bold text-forge-black">{job.estCompletion}</span>
                      </div>
                    </div>

                    {/* Embedded Process Flow Bar (Multi-step routing) */}
                    {job.operations && job.operations.length > 0 ? (
                      <OperationFlowBar
                        operations={job.operations}
                        currentOperationName={job.currentOperation}
                      />
                    ) : (
                      <div className="font-mono text-xs text-forge-steel">
                        Operations scheduled in CNC cell queue.
                      </div>
                    )}
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
                    <th className="py-2.5 px-3 font-semibold w-8"></th>
                    <th
                      onClick={() => toggleSort('order')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:text-forge-black"
                    >
                      <div className="flex items-center gap-1">
                        Order / Part
                        <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Material / Spec</th>
                    <th className="py-2.5 px-3 font-semibold">Spindle</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty (Done/Tgt)</th>
                    <th
                      onClick={() => toggleSort('progress')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:text-forge-black"
                    >
                      <div className="flex items-center gap-1">
                        Progress & Operation
                        <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('completion')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:text-forge-black"
                    >
                      <div className="flex items-center gap-1">
                        Est. Completion
                        <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 font-semibold text-center">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forge-aluminum/40">
                  {sortedJobs.map((job) => {
                    const isExpanded = expandedJobId === job.id;
                    const isDelayed = job.state === 'ON_HOLD';

                    return (
                      <React.Fragment key={job.id}>
                        <tr
                          className={`hover:bg-forge-alabaster/70 transition-colors cursor-pointer ${
                            isDelayed ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td
                            className="py-3 px-3 text-center text-forge-steel hover:text-forge-black"
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-forge-orange" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </td>

                          <td
                            className="py-3 px-3"
                            onClick={() => onSelectJob(job.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-forge-black">
                                {job.orderNumber}
                              </span>
                              {job.priority === 'URGENT' && (
                                <span className="text-[9px] px-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                                  URGENT
                                </span>
                              )}
                              {job.priority === 'HIGH' && (
                                <span className="text-[9px] px-1 bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                                  HIGH
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-forge-steel font-sans font-medium truncate max-w-[200px]">
                              {job.partName}
                            </div>
                            <div className="text-[10px] text-forge-steel/80">
                              {job.partNumber} • {job.customerCode}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-forge-black text-[11px]">
                            <div>{job.material}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-[10px] font-bold text-forge-black">
                              {job.targetMachineId}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-forge-black">
                            {job.quantityCompleted} / {job.quantityTarget}
                            {job.quantityScrapped > 0 && (
                              <span className="text-rose-600 font-normal text-[10px] block">
                                ({job.quantityScrapped} scrap)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 min-w-[200px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-forge-steel truncate max-w-[150px]">
                                  {job.currentOperation}
                                </span>
                                <span className="font-bold text-forge-black">
                                  {job.progressPercent}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-forge-alabaster border border-forge-aluminum overflow-hidden">
                                <div
                                  className={`h-full ${isDelayed ? 'bg-amber-500' : 'bg-forge-orange'}`}
                                  style={{ width: `${job.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-[11px] text-forge-steel">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.estCompletion.split(' ')[1] || job.estCompletion}
                            </div>
                            <div className="text-[9px] text-forge-steel/70">
                              Planned: {job.plannedStart.split(' ')[1]}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-forge-black">
                            ${job.verifiedUnitCost.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <StatusBadge type="production" status={job.state} size="sm" />
                          </td>
                        </tr>

                        {/* Expanded Operations Breakdown Row */}
                        {isExpanded && (
                          <tr className="bg-forge-alabaster/40 border-b border-forge-aluminum/80">
                            <td colSpan={9} className="py-3 px-8">
                              <div className="p-3 bg-white border border-forge-aluminum space-y-3">
                                <div className="flex items-center justify-between border-b border-forge-aluminum/40 pb-2">
                                  <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-forge-black">
                                    ROUTING SHEET • {job.orderNumber} ({job.partName})
                                  </span>
                                  <button
                                    onClick={() => onSelectJob(job.id)}
                                    className="text-[10px] font-mono text-forge-orange hover:underline font-bold"
                                  >
                                    OPEN FULL INSPECTOR →
                                  </button>
                                </div>

                                {job.operations && job.operations.length > 0 ? (
                                  <OperationFlowBar
                                    operations={job.operations}
                                    currentOperationName={job.currentOperation}
                                  />
                                ) : (
                                  <div className="text-[11px] text-forge-steel font-mono py-2">
                                    Operations in standard dispatch queue.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
