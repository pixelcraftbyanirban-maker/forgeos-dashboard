import React from 'react';

interface LinearGaugeProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  nominalTarget?: number;
  showTicks?: boolean;
  color?: 'orange' | 'emerald' | 'blue' | 'slate';
  className?: string;
}

export const LinearGauge: React.FC<LinearGaugeProps> = ({
  label,
  value,
  max,
  unit = '',
  nominalTarget,
  showTicks = true,
  color = 'orange',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const targetPct = nominalTarget ? Math.min(100, Math.max(0, (nominalTarget / max) * 100)) : null;

  const colorStyles = {
    orange: 'bg-forge-orange',
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    slate: 'bg-slate-700'
  };

  return (
    <div className={`space-y-1 font-mono ${className}`}>
      <div className="flex justify-between items-baseline text-[10px]">
        <span className="text-forge-steel uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-forge-black text-xs">
            {value.toLocaleString()}
          </span>
          {unit && <span className="text-forge-steel text-[9px]">{unit}</span>}
        </div>
      </div>

      {/* Gauge Track */}
      <div 
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${value} ${unit}`}
        className="h-2 bg-forge-alabaster border border-forge-aluminum relative overflow-hidden flex items-center"
      >
        <div
          className={`h-full ${colorStyles[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {targetPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-forge-black z-10"
            style={{ left: `${targetPct}%` }}
            title={`Target: ${nominalTarget}`}
          />
        )}
      </div>

      {showTicks && (
        <div className="flex justify-between text-[8px] text-forge-steel/80">
          <span>0</span>
          {nominalTarget && targetPct !== null && <span>TARGET: {nominalTarget.toLocaleString()}</span>}
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};
