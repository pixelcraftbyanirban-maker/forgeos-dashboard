import React from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { TopBar } from './TopBar';
import { ConnectionState } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  connectionState: ConnectionState;
  lastRefresh: string;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  activeExceptionsCount: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentTab,
  onTabChange,
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  connectionState,
  lastRefresh,
  onManualRefresh,
  isRefreshing,
  activeExceptionsCount
}) => {
  return (
    <div className="min-h-screen bg-forge-alabaster flex flex-col font-sans">
      <div className="flex flex-1 min-h-screen">
        {/* Dark Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={onTabChange}
          exceptionsCount={activeExceptionsCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            title={title}
            subtitle={subtitle}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            connectionState={connectionState}
            lastRefresh={lastRefresh}
            onManualRefresh={onManualRefresh}
            isRefreshing={isRefreshing}
            activeExceptionsCount={activeExceptionsCount}
            onExceptionsClick={() => onTabChange('exceptions')}
          />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

          {/* Bottom Technical Status Bar (Swiss Modernism technical footer) */}
          <footer className="border-t border-forge-aluminum bg-white px-6 py-2.5 font-mono text-[11px] text-forge-steel flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-forge-black font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                SYSTEM STATUS: ONLINE
              </span>
              <span className="text-forge-aluminum">|</span>
              <span>SHREE GANESH PRECISION • HOWRAH, WB</span>
              <span className="text-forge-aluminum">|</span>
              <span>SYNC: MTCONNECT STREAM (5s)</span>
              <span className="text-forge-aluminum">|</span>
              <span>AUDIT: IMMUTABLE LEDGER</span>
            </div>

            <div className="flex items-center gap-4 text-forge-steel text-[10px]">
              <span>FORGEOS MES • REV 1.0</span>
              <span>© 2026 FORGEOS • PRECISION. CLARITY. TRUTH.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
