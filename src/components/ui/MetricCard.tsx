import React from 'react';

interface MetricCardProps {
  category: string; // e.g. "REAL TIME", "DATA FIDELITY", "FACTORY OEE"
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'orange' | 'black' | 'emerald';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  category,
  value,
  unit,
  subtext,
  trend,
  accentColor = 'black',
  badge
}) => {
  const accentBorder =
    accentColor === 'orange'
      ? 'border-t-2 border-t-forge-orange'
      : accentColor === 'emerald'
      ? 'border-t-2 border-t-emerald-600'
      : '';

  return (
    <div className={`bg-white border border-forge-aluminum p-3.5 sm:p-4 relative flex flex-col justify-between ${accentBorder}`}>
      {/* Corner drafting marks */}
      <span className="absolute top-1 left-1 text-forge-aluminum/80 font-mono text-[9px] select-none pointer-events-none" aria-hidden="true">+</span>
      <span className="absolute bottom-1 right-1 text-forge-aluminum/80 font-mono text-[9px] select-none pointer-events-none" aria-hidden="true">+</span>

      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="font-mono text-[10px] tracking-wider uppercase text-forge-steel font-semibold truncate">
            {category}
          </span>
          {badge && (
            <span className="font-mono text-[9px] px-1 py-0.5 bg-forge-alabaster border border-forge-aluminum text-forge-black font-semibold flex-shrink-0">
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-1.5 my-1">
          <span className="font-display font-bold text-2xl lg:text-3xl tracking-tight text-forge-black">
            {value}
          </span>
          {unit && (
            <span className="font-mono text-xs text-forge-steel font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="pt-2 mt-2 border-t border-forge-aluminum/40 flex flex-wrap items-center justify-between gap-1 text-xs">
          {subtext && (
            <span className="text-forge-steel text-[11px] break-words" title={subtext}>
              {subtext}
            </span>
          )}
          {trend && (
            <span
              className={`font-mono text-[11px] font-semibold ml-auto flex-shrink-0 ${
                trend.isPositive ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
