import React from 'react';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProductionQueueCard } from '../../components/tables/ProductionQueueCard';
import { RealTimeCostsChart } from '../../components/charts/RealTimeCostsChart';
import { MachineFleetGrid } from '../../components/tables/MachineFleetGrid';
import { ExceptionsCard } from '../../components/tables/ExceptionsCard';
import { AuditHistoryCard } from '../../components/tables/AuditHistoryCard';
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
  onNavigateToTab
}) => {
  const currentRunningJob = jobs.find((j) => j.state === 'IN_PROGRESS') || jobs[0];
  const nextQueuedJob = jobs.find((j) => j.state === 'NOT_STARTED') || jobs[1];
  const delayedJob = jobs.find((j) => j.state === 'ON_HOLD');

  return (
    <div className="space-y-6">
      {/* 1. Operational Orientation Banner (Swiss Modernism aesthetic) */}
      <div className="bg-white border border-forge-aluminum p-4 relative">
        <span className="absolute top-1 left-1 text-forge-aluminum font-mono text-[9px]">+</span>
        <span className="absolute bottom-1 right-1 text-forge-aluminum font-mono text-[9px]">+</span>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-forge-black text-white font-bold tracking-widest uppercase">
                PLANT 01 • SHOP FLOOR OVERVIEW
              </span>
              <span className="font-mono text-xs text-forge-steel">
                HMLV PRECISION CNC MACHINING
              </span>
            </div>
            <h2 className="font-display font-bold text-xl lg:text-2xl text-forge-black tracking-tight">
              THE SINGLE SOURCE OF OPERATIONAL TRUTH.
            </h2>
            <p className="text-xs text-forge-steel font-sans max-w-3xl">
              One unified record for the whole shop. Real-time telemetry across 12 high-precision spindles, verified unit economics, and operational queue transparency.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-forge-aluminum/60 pt-3 lg:pt-0 lg:pl-6 font-mono text-xs flex-shrink-0">
            <div className="space-y-1 text-right">
              <div className="text-[10px] text-forge-steel uppercase">ACTIVE SPINDLE STATUS</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-forge-black text-sm">
                  {kpis.activeSpindlesCount} / {kpis.totalSpindlesCount} CUTTING METAL
                </span>
              </div>
              <div className="text-[10px] text-forge-steel">
                1 Setup • 1 Idle • 1 Stopped • 1 Alarm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Display (Directly reflecting brand PDF Page 5 & 22 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="REAL TIME"
          value="122,770"
          unit="RPM AGG"
          subtext="Active spindle rotation rate"
          accentColor="orange"
          badge="STREAM: LIVE"
        />

        <MetricCard
          category="FACTORY OEE"
          value={`${kpis.factoryOeePct}%`}
          subtext="A: 91.2% • P: 96.8% • Q: 99.1%"
          trend={{ value: "+2.4% vs Shift B", isPositive: true }}
          accentColor="emerald"
          badge="GROUNDED OEE"
        />

        <MetricCard
          category="SHOP UTILIZATION"
          value={`${kpis.shopUtilizationPct}%`}
          subtext="8 of 12 spindles cutting active parts"
          trend={{ value: "Target: 80.0%", isPositive: true }}
          accentColor="black"
          badge="SPINDLES"
        />

        <MetricCard
          category="DATA FIDELITY"
          value={`$${kpis.costs.unitCostVerified.toFixed(2)}`}
          unit="/ UNIT"
          subtext="Verified unit cost (Order #123442)"
          trend={{ value: "AUDIT SIGNED", isPositive: true }}
          accentColor="orange"
          badge="VERIFIED"
        />
      </div>

      {/* 3. Operational Execution & Costs Row (Directly matching Page 5 & 22) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Running Job & Next Queue */}
        <div className="lg:col-span-7">
          <ProductionQueueCard
            currentJob={currentRunningJob}
            nextJob={nextQueuedJob}
            delayedJob={delayedJob}
            onSelectJob={onSelectJob}
          />
        </div>

        {/* Right Column: Real-Time Costs Breakdown */}
        <div className="lg:col-span-5">
          <RealTimeCostsChart costs={kpis.costs} />
        </div>
      </div>

      {/* 4. Full Machine Fleet Grid (12 Spindles) */}
      <div>
        <MachineFleetGrid
          machines={machines}
          onSelectMachine={onSelectMachine}
        />
      </div>

      {/* 5. Bottom Split: Exceptions & Immutable Production History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
