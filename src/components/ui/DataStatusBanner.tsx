import React from 'react';
import { ConnectionState } from '../../types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { MotionButton } from '../../motion';

interface DataStatusBannerProps {
  connectionState: ConnectionState;
  lastRefresh: string;
  onRefresh?: (fullSkeleton?: boolean) => void;
  isRefreshing?: boolean;
  delayedCount?: number;
  disconnectedCount?: number;
  className?: string;
}

export const DataStatusBanner: React.FC<DataStatusBannerProps> = ({
  connectionState,
  lastRefresh,
  onRefresh,
  isRefreshing = false,
  delayedCount = 1,
  disconnectedCount = 0,
  className = ''
}) => {
  const isHealthy = connectionState === 'CURRENT' && disconnectedCount === 0;

  return (
    <div className={`bg-forge-alabaster border border-forge-aluminum p-2.5 font-mono text-[10px] flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Stream Health */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`} aria-hidden="true" />
          <span className="font-bold text-forge-black uppercase tracking-wider">
            MTCONNECT v2.0 STREAM: {connectionState}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-forge-steel border-l border-forge-aluminum/60 pl-3">
          <span>HOWRAH SUBSTATION 02</span>
          <span aria-hidden="true">•</span>
          <span>POLL FREQ: 5s (120ms ping)</span>
          <span aria-hidden="true">•</span>
          <span>LAST SYNC: {lastRefresh.includes('IST') ? lastRefresh : `${lastRefresh} IST`}</span>
        </div>
      </div>

      {/* Warnings & Refresh Control */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {delayedCount > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-400 text-amber-950 text-[9px] font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" aria-hidden="true" />
            <span>{delayedCount} DELAYED TELEMETRY SPINDLE (CNC-07)</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-white border border-forge-aluminum text-forge-steel text-[9px] uppercase tracking-wider font-semibold">
            SHREE GANESH PRECISION
          </span>

          {onRefresh && (
            <MotionButton
              type="button"
              onClick={(e: React.MouseEvent) => onRefresh(e.shiftKey)}
              disabled={isRefreshing}
              aria-label={isRefreshing ? "Synchronizing telemetry data..." : "Manually synchronize telemetry data (Shift+Click for skeleton preview)"}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-forge-aluminum hover:border-forge-black text-forge-black font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
              title={isRefreshing ? "Synchronizing..." : "Manual Poll Sync (Shift+Click to test skeleton loader)"}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-forge-orange' : 'text-forge-steel'}`} aria-hidden="true" />
              <span>SYNC</span>
            </MotionButton>
          )}
        </div>
      </div>
    </div>
  );
};
