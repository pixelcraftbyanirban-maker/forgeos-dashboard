import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { ProductionPage } from './pages/Production/ProductionPage';
import { MachinesPage } from './pages/Machines/MachinesPage';
import { ExceptionsPage } from './pages/Exceptions/ExceptionsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { OperatorConsolePage } from './pages/Operator/OperatorConsolePage';
import { DetailDrawer } from './components/ui/DetailDrawer';
import { PageTransition, DashboardSkeleton } from './motion';
import {
  INITIAL_MACHINES,
  INITIAL_JOBS,
  INITIAL_EXCEPTIONS,
  INITIAL_FACTORY_KPIS,
  INITIAL_AUDIT_HISTORY
} from './data/mockData';
import { Machine, Job, ProductionException, FactoryKPIs, ConnectionState } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [jobs] = useState<Job[]>(INITIAL_JOBS);
  const [exceptions, setExceptions] = useState<ProductionException[]>(INITIAL_EXCEPTIONS);
  const [kpis] = useState<FactoryKPIs>(INITIAL_FACTORY_KPIS);
  const [connectionState] = useState<ConnectionState>('CURRENT');
  const [lastRefresh, setLastRefresh] = useState('14:30:00 IST');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial MTConnect stream connection simulation with skeleton loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Inspector Drawer State
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filtered lists if search query is active
  const filteredMachines = machines.filter(
    (m) =>
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.currentJobId && m.currentJobId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.targetMachineId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle manual refresh / polling simulation
  const handleManualRefresh = (fullSkeleton = false) => {
    if (fullSkeleton) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 700);
      return;
    }
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate slight realistic telemetry fluctuations (RPM, OEE)
      setMachines((prev) =>
        prev.map((m) => {
          if (m.state === 'RUNNING') {
            const jitter = Math.floor(Math.random() * 80) - 40;
            return {
              ...m,
              spindleRpm: Math.max(8000, m.spindleRpm + jitter),
              telemetryTimestamp: 'Just now'
            };
          }
          return m;
        })
      );

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLastRefresh(`${timeStr} IST`);
      setIsRefreshing(false);
    }, 450);
  };

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectMachine = (machineId: string) => {
    const m = machines.find((item) => item.id === machineId);
    if (m) {
      setSelectedMachine(m);
      setSelectedJob(null);
      setIsDrawerOpen(true);
    }
  };

  const handleSelectJob = (jobId: string) => {
    const j = jobs.find((item) => item.id === jobId);
    if (j) {
      setSelectedJob(j);
      setSelectedMachine(null);
      setIsDrawerOpen(true);
    }
  };

  const handleAcknowledgeException = (id: string) => {
    setExceptions((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? { ...ex, acknowledged: true, acknowledgedBy: 'Arindam Chatterjee (Prod. Mgr)' }
          : ex
      )
    );
  };

  const activeExceptionsCount = exceptions.filter((e) => !e.acknowledged).length;

  return (
    <>
      <AppShell
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        title={
          currentTab === 'overview'
            ? 'Shop-Floor Overview'
            : currentTab === 'orders'
            ? 'Active Work Orders'
            : currentTab === 'production'
            ? 'Production Schedule'
            : currentTab === 'machines'
            ? 'Spindle Fleet'
            : currentTab === 'quality' || currentTab === 'exceptions'
            ? 'Exceptions & Deviations'
            : currentTab === 'inventory'
            ? 'Material & Tooling Inventory'
            : currentTab === 'operator'
            ? 'Operator Shop-Floor Terminal'
            : 'Analytics Reports'
        }
        subtitle={
          currentTab === 'overview'
            ? 'Real-time performance across machines, jobs, and production.'
            : currentTab === 'orders'
            ? 'Work Order Routing, Part Allocation & Batch Progress'
            : currentTab === 'production'
            ? 'Work Orders, Operation Routing & Progress'
            : currentTab === 'machines'
            ? 'Telemetry Channels, Speed, Feeds & OEE Breakdown'
            : currentTab === 'quality' || currentTab === 'exceptions'
            ? 'Active Alarms, Tool Wear & Supervisor Sign-off'
            : currentTab === 'inventory'
            ? 'Raw Billet Stock, Carbide Inserts & Tool Wear Status'
            : currentTab === 'operator'
            ? 'Tablet-optimized console for job execution, scrap tracking & maintenance dispatch'
            : 'Historical Audit Trails & Shipped Part Certification'
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        connectionState={connectionState}
        lastRefresh={lastRefresh}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        activeExceptionsCount={activeExceptionsCount}
      >
        <PageTransition pageKey={isLoading ? 'loading-skeleton' : currentTab}>
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {currentTab === 'overview' && (
                <OverviewPage
                  kpis={kpis}
                  machines={filteredMachines}
                  jobs={filteredJobs}
                  exceptions={exceptions}
                  auditHistory={INITIAL_AUDIT_HISTORY}
                  onSelectMachine={handleSelectMachine}
                  onSelectJob={handleSelectJob}
                  onAcknowledgeException={handleAcknowledgeException}
                  onNavigateToTab={setCurrentTab}
                  onRefresh={handleManualRefresh}
                  isRefreshing={isRefreshing}
                />
              )}

              {(currentTab === 'production' || currentTab === 'orders') && (
                <ProductionPage
                  jobs={filteredJobs}
                  onSelectJob={handleSelectJob}
                />
              )}

              {currentTab === 'machines' && (
                <MachinesPage
                  machines={filteredMachines}
                  onSelectMachine={handleSelectMachine}
                />
              )}

              {(currentTab === 'exceptions' || currentTab === 'quality') && (
                <ExceptionsPage
                  exceptions={exceptions}
                  onAcknowledge={handleAcknowledgeException}
                  onSelectMachine={handleSelectMachine}
                  onSelectJob={handleSelectJob}
                />
              )}

              {currentTab === 'inventory' && (
                <InventoryPage />
              )}

              {currentTab === 'operator' && (
                <OperatorConsolePage
                  machines={machines}
                  jobs={jobs}
                  onSelectMachine={handleSelectMachine}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsPage
                  auditHistory={INITIAL_AUDIT_HISTORY}
                />
              )}
            </>
          )}
        </PageTransition>
      </AppShell>

      {/* Inspector Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        machine={selectedMachine}
        job={selectedJob}
      />
    </>
  );
};

export default App;
