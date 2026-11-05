import React, { useState } from 'react';
import { ChamferCard } from '../ui/ChamferCard';

interface DayData {
  day: string;
  actual: number;
  target: number;
}

interface ProductionTrendChartProps {
  data?: DayData[];
}

export const ProductionTrendChart: React.FC<ProductionTrendChartProps> = ({
  data = [
    { day: 'Mon', actual: 28, target: 45 },
    { day: 'Tue', actual: 36, target: 52 },
    { day: 'Wed', actual: 48, target: 60 },
    { day: 'Thu', actual: 56, target: 65 },
    { day: 'Fri', actual: 68, target: 75 },
    { day: 'Sat', actual: 80, target: 82 },
    { day: 'Sun', actual: 92, target: 90 }
  ]
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const yTicks = [100, 75, 50, 25, 0];

  return (
    <ChamferCard
      title="Production Trend"
      action={
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1.5 text-forge-steel">
            <span className="w-2.5 h-2.5 bg-forge-aluminum inline-block" aria-hidden="true" />
            TARGET
          </span>
          <span className="flex items-center gap-1.5 text-forge-black font-semibold">
            <span className="w-2.5 h-2.5 bg-forge-orange inline-block" aria-hidden="true" />
            ACTUAL
          </span>
        </div>
      }
    >
      <div className="pt-2 pb-1">
        {/* Chart Viewport */}
        <div className="relative h-44 sm:h-48 flex items-end">
          {/* Y-Axis Grid Lines & Labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
            {yTicks.map((val) => (
              <div key={val} className="flex items-center w-full">
                <span className="w-6 text-[10px] font-mono text-forge-steel text-right pr-2">
                  {val}
                </span>
                <div className="flex-1 border-b border-forge-aluminum/40 border-dashed" />
              </div>
            ))}
          </div>

          {/* Bar Groups (Offset by Y-axis label width) */}
          <div className="ml-7 w-full h-full flex items-end justify-between gap-1 sm:gap-3 z-10 pt-4">
            {data.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const targetHeightPct = Math.min(100, item.target);
              const actualHeightPct = Math.min(100, item.actual);

              return (
                <div
                  key={item.day}
                  className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  tabIndex={0}
                  role="region"
                  aria-label={`${item.day}: Actual ${item.actual} units, Target ${item.target} units`}
                  onFocus={() => setHoveredIndex(idx)}
                  onBlur={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-11 z-30 bg-forge-black text-white px-2 py-1 text-[10px] font-mono shadow-md border border-forge-aluminum whitespace-nowrap select-none animate-in fade-in duration-150">
                      <div>
                        {item.day}: <strong className="text-forge-orange">{item.actual}</strong> / {item.target} pcs
                      </div>
                      <div className="text-[9px] text-zinc-300">
                        {Math.round((item.actual / item.target) * 100)}% of target
                      </div>
                    </div>
                  )}

                  {/* Dual Bar Columns */}
                  <div className="w-full max-w-[28px] sm:max-w-[34px] flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Target Bar (Light Aluminum) */}
                    <div
                      style={{ height: `${targetHeightPct}%` }}
                      className="w-1/2 bg-forge-aluminum/80 group-hover:bg-forge-aluminum transition-all duration-200"
                      aria-hidden="true"
                    />

                    {/* Actual Bar (Forge Orange) */}
                    <div
                      style={{ height: `${actualHeightPct}%` }}
                      className="w-1/2 bg-forge-orange group-hover:brightness-110 transition-all duration-200 shadow-sm"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[10px] sm:text-xs font-mono mt-2 transition-colors ${
                    isHovered ? 'text-forge-orange font-bold' : 'text-forge-steel'
                  }`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ChamferCard>
  );
};
