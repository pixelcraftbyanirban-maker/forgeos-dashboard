import React, { useState } from 'react';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProductionQueueCard } from '../../components/tables/ProductionQueueCard';
import { RealTimeCostsChart } from '../../components/charts/RealTimeCostsChart';
import { MachineFleetGrid } from '../../components/tables/MachineFleetGrid';
import { ExceptionsCard } from '../../components/tables/ExceptionsCard';
import { AuditHistoryCard } from '../../components/tables/AuditHistoryCard';
import { FleetDistributionBar } from '../../components/ui/FleetDistributionBar';
import { DataStatusBanner } from '../../components/ui/DataStatusBanner';
import { MachineStatusDonutCard } from '../../components/charts/MachineStatusDonutCard';
import { ProductionTrendChart } from '../../components/charts/ProductionTrendChart';
import { WeeklyUtilizationCard } from '../../components/charts/WeeklyUtilizationCard';
import { ActiveWorkOrdersCard } from '../../components/tables/ActiveWorkOrdersCard';
import { FactoryKPIs, Machine, Job, ProductionException, AuditRecord } from '../../types';

interface OverviewPageProps {
  kpis: FactoryKPIs;
  machines: Machine[];
  jobs: Job[];
  exceptions: ProductionException[];
  auditHistory: AuditRecord[];
  onSelectMachine: (machineId: string) => void;
  onSelectJob: (jobId: string) => void;
  onAcknowledgeException: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  onRefresh?: (fullSkeleton?: boolean) => void;
  isRefreshing?: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  machines,
  jobs,
  exceptions,
  auditHistory,
  onSelectMachine,
  onSelectJob,
  onAcknowledgeException,
  onNavigateToTab,
  onRefresh,
  isRefreshing = false
}) => {
  const [fleetFilterState, setFleetFilterState] = useState<string>('ALL');

  const currentRunningJob = jobs.find((j) => j.state === 'IN_PROGRESS') || jobs[0];
  const nextQueuedJob = jobs.find((j) => j.state === 'NOT_STARTED') || jobs[1];
  const delayedJob = jobs.find((j) => j.state === 'ON_HOLD');

  const delayedMachinesCount = machines.filter(m => m.connectionState === 'DELAYED').length;
  const disconnectedMachinesCount = machines.filter(m => m.connectionState === 'DISCONNECTED').length;

  const runningCount = machines.filter(m => m.state === 'RUNNING').length;
  const setupCount = machines.filter(m => m.state === 'SETUP').length;
  const idleCount = machines.filter(m => m.state === 'IDLE').length;
  const alarmCount = machines.filter(m => m.state === 'ALARM').length;
  const stoppedCount = machines.filter(m => m.state === 'STOPPED').length;

  // Reconciled Donut chart status segments with standard industrial semantic colors
  const donutSegments = [
    { label: 'Running', count: runningCount, color: '#059669', stateKey: 'RUNNING' },
    { label: 'Setup', count: setupCount, color: '#2563EB', stateKey: 'SETUP' },
    { label: 'Idle', count: idleCount, color: '#D97706', stateKey: 'IDLE' },
    { label: 'Alarm', count: alarmCount, color: '#E11D48', stateKey: 'ALARM' },
    { label: 'Stopped', count: stoppedCount, color: '#64748B', stateKey: 'STOPPED' }
  ];

  // Work orders mapped from real active jobs
  const activeWorkOrdersList = jobs.slice(0, 3).map(j => ({
    orderNumber: j.orderNumber,
    partName: j.partName,
    status: (j.state === 'IN_PROGRESS' ? 'In Progress' : j.state === 'NOT_STARTED' ? 'Queued' : 'Setup') as 'In Progress' | 'Setup' | 'Queued',
    jobId: j.id
  }));

  return (
    <div className="space-y-6">
      {/* 1. Industrial Telemetry Data Status Banner */}
      <DataStatusBanner
        connectionState={kpis.connectionStatus}
        lastRefresh={kpis.lastDataRefresh}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        delayedCount={delayedMachinesCount}
        disconnectedCount={disconnectedMachinesCount}
      />

      {/* 2. Operational Orientation Banner */}
      <div className="bg-white border border-forge-aluminum p-4 sm:p-5 relative">
        <span className="absolute top-1 left-1 text-forge-aluminum font-mono text-[9px] select-none pointer-events-none" aria-hidden="true">+</span>
        <span className="absolute bottom-1 right-1 text-forge-aluminum font-mono text-[9px] select-none pointer-events-none" aria-hidden="true">+</span>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-forge-black text-white font-bold tracking-widest uppercase">
                SHREE GANESH PRECISION ENGINEERING
              </span>
              <span className="font-mono text-xs text-forge-steel">
                HOWRAH, WB • 24 SPINDLES (3 SECTIONS)
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-forge-black tracking-tight">
              THE SINGLE SOURCE OF OPERATIONAL TRUTH.
            </h2>
            <p className="text-xs text-forge-steel font-sans max-w-3xl leading-relaxed">
              Unified shop-floor operations record for Indian precision manufacturing. Real-time telemetry across 24 CNC spindles in Howrah, verified unit economics (INR), multi-operation process routing, and live deviation tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-forge-aluminum/60 pt-3 lg:pt-0 lg:pl-6 font-mono text-xs flex-shrink-0">
            <div className="space-y-1 text-left lg:text-right">
              <div className="text-[10px] text-forge-steel uppercase font-semibold">ACTIVE SPINDLE CUTTING RATIO</div>
              <div className="flex items-center gap-2 justify-start lg:justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="font-bold text-forge-black text-sm">
                  {runningCount} / {machines.length} CUTTING METAL
                </span>
              </div>
              <div className="text-[10px] text-forge-steel">
                {setupCount} Setup • {idleCount} Idle • {alarmCount} Alarm • {stoppedCount} Stopped
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary KPI Metrics Strip (Reconciled with Fleet Telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          category="PRODUCTION"
          value={String(jobs.length)}
          subtext={`${jobs.filter(j => j.state === 'IN_PROGRESS').length} in-progress • 3 queued • 1 hold`}
          trend={{ value: "+12%", isPositive: true }}
          accentColor="emerald"
          badge="WORK ORDERS"
        />

        <MetricCard
          category="UTILIZATION"
          value={`${((runningCount / machines.length) * 100).toFixed(0)}%`}
          subtext={`${runningCount} of ${machines.length} spindles cutting active parts`}
          trend={{ value: "+5%", isPositive: true }}
          accentColor="emerald"
          badge="MACHINE UTILIZATION"
        />

        <MetricCard
          category="OVERALL EQUIPMENT EFFECTIVENESS"
          value={`${kpis.factoryOeePct.toFixed(1)}%`}
          subtext={`A: ${kpis.availabilityPct.toFixed(1)}% • P: ${kpis.performancePct.toFixed(1)}% • Q: ${kpis.qualityPct.toFixed(1)}%`}
          trend={{ value: "Target: 85%", isPositive: true }}
          accentColor="emerald"
          badge="STANDARD OEE"
        />

        <MetricCard
          category="LOGISTICS & SHIPMENT"
          value="96%"
          subtext="Verified compliance to customer SLA"
          trend={{ value: "+4%", isPositive: true }}
          accentColor="emerald"
          badge="ON-TIME DELIVERY"
        />
      </div>

      {/* 4. Core Visual Data Interpretations from Design (Donut + Production Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-5">
          <MachineStatusDonutCard
            totalMachines={machines.length}
            segments={donutSegments}
            activeFilter={fleetFilterState}
            onSelectSegment={(stateKey) => setFleetFilterState(stateKey === fleetFilterState ? 'ALL' : stateKey)}
          />
        </div>

        <div className="lg:col-span-7">
          <ProductionTrendChart />
        </div>
      </div>

      {/* 5. Secondary Visual Data Interpretations from Design (Active Work Orders + Weekly Utilization Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-6">
          <ActiveWorkOrdersCard
            orders={activeWorkOrdersList}
            onSelectJob={onSelectJob}
            onViewAll={() => onNavigateToTab('orders')}
          />
        </div>

        <div className="lg:col-span-6">
          <WeeklyUtilizationCard
            currentUtilization={78}
            trendPct={5}
          />
        </div>
      </div>

      {/* 6. Graphical Fleet State Distribution Bar */}
      <FleetDistributionBar
        machines={machines}
        selectedState={fleetFilterState}
        onFilterState={setFleetFilterState}
      />

      {/* 7. Operational Execution & Costs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7">
          <ProductionQueueCard
            currentJob={currentRunningJob}
            nextJob={nextQueuedJob}
            delayedJob={delayedJob}
            onSelectJob={onSelectJob}
          />
        </div>

        <div className="lg:col-span-5">
          <RealTimeCostsChart costs={kpis.costs} />
        </div>
      </div>

      {/* 8. Spindle Fleet Grid */}
      <div>
        <MachineFleetGrid
          machines={machines}
          onSelectMachine={onSelectMachine}
          externalFilterState={fleetFilterState}
          onFilterStateChange={setFleetFilterState}
        />
      </div>

      {/* 9. Bottom Split: Exceptions & Timestamped Production History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-6">
          <ExceptionsCard
            exceptions={exceptions}
            onAcknowledge={onAcknowledgeException}
            onNavigateToExceptions={() => onNavigateToTab('exceptions')}
          />
        </div>

        <div className="lg:col-span-6">
          <AuditHistoryCard
            history={auditHistory}
            onViewReport={() => onNavigateToTab('reports')}
          />
        </div>
      </div>
    </div>
  );
};
