import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
  style?: React.CSSProperties;
}

/**
 * Base Industrial Skeleton Primitive with subtle linear shimmer
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  shimmer = true,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden bg-forge-aluminum-light/70 ${className}`}
      style={style}
      aria-hidden="true"
    >
      {shimmer && !shouldReduceMotion && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
        />
      )}
    </div>
  );
};

/**
 * Metric Card Skeleton matching MetricCard.tsx layout & drafting marks
 */
export const MetricCardSkeleton: React.FC<{ accentColor?: 'orange' | 'emerald' | 'black' }> = ({
  accentColor = 'black',
}) => {
  const accentBorder =
    accentColor === 'orange'
      ? 'border-t-2 border-t-forge-orange'
      : accentColor === 'emerald'
      ? 'border-t-2 border-t-emerald-600'
      : '';

  return (
    <div className={`bg-white border border-forge-aluminum p-3.5 sm:p-4 relative flex flex-col justify-between h-[116px] sm:h-[124px] ${accentBorder}`}>
      {/* Corner drafting marks */}
      <span className="absolute top-1 left-1 text-forge-aluminum/80 font-mono text-[9px] select-none pointer-events-none">+</span>
      <span className="absolute bottom-1 right-1 text-forge-aluminum/80 font-mono text-[9px] select-none pointer-events-none">+</span>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-forge-aluminum/40 flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

/**
 * Donut Chart Skeleton matching MachineStatusDonutCard.tsx
 */
export const DonutChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-forge-aluminum p-4 relative space-y-4">
      <span className="absolute -top-1.5 -left-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>
      <span className="absolute -bottom-1.5 -right-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>

      <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Donut circle placeholder */}
        <div className="relative w-44 h-44 rounded-full border-[18px] border-forge-aluminum-light/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Legend rows */}
        <div className="w-full sm:w-auto flex-1 max-w-xs space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 border border-forge-aluminum/40">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Production Trend Bar Chart Skeleton matching ProductionTrendChart.tsx
 */
export const ProductionTrendSkeleton: React.FC = () => {
  const heights = [45, 60, 52, 75, 68, 85, 92];

  return (
    <div className="bg-white border border-forge-aluminum p-4 relative space-y-4">
      <span className="absolute -top-1.5 -left-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>
      <span className="absolute -bottom-1.5 -right-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>

      <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2.5">
        <Skeleton className="h-3.5 w-36" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="h-44 sm:h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 ml-6">
        {heights.map((h, i) => (
          <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
            <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-full">
              <Skeleton className="w-1/2" style={{ height: `${h * 0.8}%` }} />
              <Skeleton className="w-1/2" style={{ height: `${h}%` }} />
            </div>
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Weekly Utilization Sparkline Skeleton
 */
export const WeeklyUtilizationSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-forge-aluminum p-4 relative space-y-4">
      <span className="absolute -top-1.5 -left-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>
      <span className="absolute -bottom-1.5 -right-1.5 text-forge-aluminum font-mono text-[10px] select-none">+</span>

      <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="w-full sm:flex-1 h-24 flex items-end gap-2">
          <Skeleton className="w-full h-16" />
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 sm:border-l border-forge-aluminum/60 pt-3 sm:pt-0 sm:pl-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
};

/**
 * Machine Fleet Grid Card Skeleton
 */
export const MachineCardSkeleton: React.FC = () => {
  return (
    <div className="border border-forge-aluminum bg-white p-3.5 relative flex flex-col justify-between space-y-3 h-[280px]">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="py-2 border-t border-forge-aluminum/40 space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="py-1.5 border-t border-forge-aluminum/40 flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="py-2 border-t border-forge-aluminum/40 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>

      <div className="pt-2 border-t border-forge-aluminum/40 flex items-center justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
};

/**
 * Complete Dashboard Skeleton Layout matching OverviewPage.tsx
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200" aria-label="Loading dashboard data">
      {/* 1. Status Banner Skeleton */}
      <div className="bg-forge-alabaster border border-forge-aluminum p-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-36 hidden sm:block" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      {/* 2. Orientation Banner Skeleton */}
      <div className="bg-white border border-forge-aluminum p-4 sm:p-5 relative space-y-3">
        <span className="absolute top-1 left-1 text-forge-aluminum font-mono text-[9px]">+</span>
        <span className="absolute bottom-1 right-1 text-forge-aluminum font-mono text-[9px]">+</span>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-80 sm:w-96" />
            <Skeleton className="h-3.5 w-full max-w-xl" />
          </div>
          <div className="space-y-1 border-t lg:border-t-0 lg:border-l border-forge-aluminum/60 pt-3 lg:pt-0 lg:pl-6">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>

      {/* 3. KPI Metrics Strip Skeleton (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCardSkeleton accentColor="emerald" />
        <MetricCardSkeleton accentColor="emerald" />
        <MetricCardSkeleton accentColor="emerald" />
        <MetricCardSkeleton accentColor="emerald" />
      </div>

      {/* 4. Core Visual Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-5">
          <DonutChartSkeleton />
        </div>
        <div className="lg:col-span-7">
          <ProductionTrendSkeleton />
        </div>
      </div>

      {/* 5. Secondary Visual Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-6">
          <div className="bg-white border border-forge-aluminum p-4 space-y-3 h-[220px]">
            <div className="flex justify-between border-b border-forge-aluminum/60 pb-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-6">
          <WeeklyUtilizationSkeleton />
        </div>
      </div>

      {/* 6. Spindle Fleet Grid Skeleton (8 cards placeholder) */}
      <div className="bg-white border border-forge-aluminum p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2.5">
          <Skeleton className="h-4 w-56" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <MachineCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
