import React from 'react';
import { Search, RefreshCw, AlertCircle, Clock } from 'lucide-react';
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
  onExceptionsClick
}) => {
  return (
    <header className="h-16 bg-white border-b border-forge-aluminum px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-lg text-forge-black tracking-tight uppercase">
              {title}
            </h1>
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-forge-steel font-semibold uppercase">
              HMLV CELL
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-forge-steel font-sans truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-forge-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, machines (e.g. CNC-01), materials, parts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange focus:bg-white transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-forge-steel px-1 bg-white border border-forge-aluminum">
            /
          </kbd>
        </div>
      </div>

      {/* Right Action & Telemetry Controls */}
      <div className="flex items-center gap-3">
        {/* Sample Data Disclaimer Tag */}
        <span className="hidden xl:inline-flex items-center gap-1 font-mono text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          CALIBRATED SAMPLE DATA
        </span>

        {/* Data Freshness Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              connectionState === 'CURRENT' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <span className="text-[11px] text-forge-steel">
              SYNC: <strong className="text-forge-black">{connectionState}</strong>
            </span>
          </div>
          <span className="text-forge-aluminum">|</span>
          <span className="text-[10px] text-forge-steel flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastRefresh}
          </span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          title="Manual Telemetry Poll"
          className="p-1.5 bg-forge-alabaster hover:bg-forge-aluminum/30 border border-forge-aluminum text-forge-black transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-forge-orange' : 'text-forge-black'}`} />
        </button>

        {/* Exceptions Quick Pill */}
        <button
          onClick={onExceptionsClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-colors ${
            activeExceptionsCount > 0
              ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              : 'bg-forge-alabaster text-forge-steel border-forge-aluminum hover:text-forge-black'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span className="font-semibold text-[11px]">
            {activeExceptionsCount} EXCEPTIONS
          </span>
        </button>
      </div>
    </header>
  );
};
