import React, { useState } from 'react';
import { Search, RefreshCw, Clock, Menu, X, Calendar, ChevronDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMotion, MotionIconButton, SPRINGS } from '../../motion';
import { ConnectionState } from '../../types';

interface TopBarProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  connectionState: ConnectionState;
  lastRefresh: string;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  activeExceptionsCount: number;
  onExceptionsClick: () => void;
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
  selectedTimeframe?: string;
  onTimeframeChange?: (t: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  connectionState,
  lastRefresh,
  onManualRefresh,
  isRefreshing,
  activeExceptionsCount,
  onExceptionsClick,
  onToggleMobileNav,
  isMobileNavOpen = false,
  selectedTimeframe = 'This Week',
  onTimeframeChange
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const timeframes = ['Today', 'This Shift', 'This Week', 'This Month'];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-forge-aluminum transition-shadow">
      <div className="min-h-16 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation-drawer"
              className="lg:hidden p-2 text-forge-black hover:bg-forge-alabaster border border-forge-aluminum flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
            >
              {isMobileNavOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="font-display font-bold text-base sm:text-lg text-forge-black tracking-tight uppercase truncate">
                {title}
              </h1>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-forge-steel font-semibold uppercase flex-shrink-0 hidden xs:inline-block">
                HOWRAH • 24 SPINDLES
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-forge-steel font-sans truncate max-w-xs sm:max-w-md md:max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center Search Input (Desktop & Tablet) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-forge-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search work orders, spindles, materials, and parts"
              placeholder="Search orders, spindles, materials, parts... (/)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/70 focus:outline-none focus:border-forge-orange focus:bg-white transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-forge-steel px-1 bg-white border border-forge-aluminum select-none" aria-hidden="true">
              /
            </kbd>
          </div>
        </div>

        {/* Right Action & Telemetry Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(prev => !prev)}
            aria-label={isMobileSearchOpen ? "Close search bar" : "Open search bar"}
            aria-expanded={isMobileSearchOpen}
            className="md:hidden p-2 bg-forge-alabaster hover:bg-forge-aluminum/30 border border-forge-aluminum text-forge-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Timeframe Dropdown (Design element: [ 📅 This Week ⌄ ]) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTimeframeOpen(prev => !prev)}
              aria-expanded={isTimeframeOpen}
              aria-label={`Timeframe filter: ${selectedTimeframe}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 bg-white hover:bg-forge-alabaster border border-forge-aluminum text-forge-black font-sans text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
            >
              <Calendar className="w-3.5 h-3.5 text-forge-steel" aria-hidden="true" />
              <span className="hidden sm:inline font-medium">{selectedTimeframe}</span>
              <ChevronDown className={`w-3 h-3 text-forge-steel transition-transform duration-200 ${isTimeframeOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            <DropdownMotion isOpen={isTimeframeOpen} className="absolute right-0 top-full mt-1 w-36 bg-white border border-forge-aluminum shadow-lg z-30 py-1 font-mono text-xs">
              {timeframes.map((tf) => (
                <button
                  type="button"
                  key={tf}
                  onClick={() => {
                    if (onTimeframeChange) onTimeframeChange(tf);
                    setIsTimeframeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    selectedTimeframe === tf ? 'text-forge-orange font-bold bg-orange-50/70 border-l-2 border-l-forge-orange' : 'text-forge-black hover:bg-forge-alabaster'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </DropdownMotion>
          </div>

          {/* Data Freshness Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                connectionState === 'CURRENT' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} aria-hidden="true" />
              <span className="text-[11px] text-forge-steel">
                SYNC: <strong className="text-forge-black">{connectionState}</strong>
              </span>
            </div>
            <span className="text-forge-aluminum" aria-hidden="true">|</span>
            <span className="text-[10px] text-forge-steel flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {lastRefresh.includes('IST') ? lastRefresh : `${lastRefresh} IST`}
            </span>
          </div>

          {/* Refresh Action */}
          <MotionIconButton
            type="button"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            aria-label={isRefreshing ? "Refreshing spindle telemetry data..." : "Refresh telemetry data now"}
            title="Manual Telemetry Poll"
            className="p-2 sm:p-1.5 bg-forge-alabaster hover:bg-forge-aluminum/30 border border-forge-aluminum text-forge-black transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-forge-orange' : 'text-forge-black'}`} aria-hidden="true" />
          </MotionIconButton>

          {/* Notification Bell (Design element: [ 🔔 1 ]) */}
          <MotionIconButton
            type="button"
            onClick={onExceptionsClick}
            aria-label={`View ${activeExceptionsCount} production alerts and exceptions`}
            title={`${activeExceptionsCount} Active Exceptions`}
            className="relative p-2 sm:p-1.5 bg-forge-alabaster hover:bg-forge-aluminum/30 border border-forge-aluminum text-forge-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Bell className="w-4 h-4 text-forge-black" aria-hidden="true" />
            {activeExceptionsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRINGS.snappy}
                className="absolute -top-1 -right-1 w-4 h-4 bg-forge-orange text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {activeExceptionsCount}
              </motion.span>
            )}
          </MotionIconButton>

          {/* User Profile Avatar (Design element: [ AS ]) */}
          <div className="flex items-center pl-1 sm:pl-2 border-l border-forge-aluminum/70">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRINGS.snappy}
              className="w-8 h-8 rounded-full bg-forge-black text-white font-mono font-bold text-xs flex items-center justify-center border border-forge-steel shadow-sm select-none cursor-pointer hover:border-forge-orange transition-colors"
              title="Anirban Sarkar • Lead Production Engineer"
              aria-label="User profile: Anirban Sarkar"
            >
              AS
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Drawer with AnimatePresence */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden p-3 bg-forge-alabaster border-t border-forge-aluminum md:hidden"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-forge-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                aria-label="Search work orders, spindles, materials, and parts"
                placeholder="Search orders, spindles, parts, materials..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/70 focus:outline-none focus:border-forge-orange"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search input"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forge-steel hover:text-forge-black p-1"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
