import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { TopBar } from './TopBar';
import { ConnectionState } from '../../types';
import { MobileSidebarDrawer } from '../../motion';

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen bg-forge-alabaster flex flex-col font-sans">
      {/* WCAG 2.4.1 Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-forge-orange focus:text-white focus:font-mono focus:text-xs focus:font-bold focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-black"
      >
        Skip to main content
      </a>

      <div className="flex flex-1 min-h-screen relative">
        {/* Desktop Sidebar (lg and above) */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            exceptionsCount={activeExceptionsCount}
          />
        </div>

        {/* Mobile Off-Canvas Sidebar Drawer with Smooth Backdrop & Slide */}
        <MobileSidebarDrawer
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        >
          <Sidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            exceptionsCount={activeExceptionsCount}
            isMobile={true}
            onCloseMobile={() => setIsMobileNavOpen(false)}
          />
        </MobileSidebarDrawer>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
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
            onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
            isMobileNavOpen={isMobileNavOpen}
          />

          <main 
            id="main-content" 
            tabIndex={-1} 
            className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 focus:outline-none"
          >
            {children}
          </main>

          {/* Technical Status Footer (WCAG contentinfo landmark) */}
          <footer 
            role="contentinfo"
            className="border-t border-forge-aluminum bg-white px-4 sm:px-6 py-3 font-mono text-[11px] text-forge-steel flex flex-col md:flex-row items-center justify-between gap-3 text-center sm:text-left"
          >
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5 text-forge-black font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                SYSTEM STATUS: ONLINE
              </span>
              <span className="text-forge-aluminum hidden sm:inline" aria-hidden="true">|</span>
              <span>SHREE GANESH PRECISION • HOWRAH</span>
              <span className="text-forge-aluminum hidden md:inline" aria-hidden="true">|</span>
              <span className="hidden md:inline">SYNC: MTCONNECT STREAM (5s)</span>
              <span className="text-forge-aluminum hidden lg:inline" aria-hidden="true">|</span>
              <span className="hidden lg:inline">AUDIT: TIMESTAMPED AUDIT LOG</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-forge-steel text-[10px]">
              <span>FORGEOS MES • REV 1.0</span>
              <span>© 2026 FORGEOS • PRECISION. CLARITY. TRUTH.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
