import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { RealTimeCosts } from '../../types';
import { CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { AnimatedHorizontalBar } from '../../motion';

interface RealTimeCostsChartProps {
  costs: RealTimeCosts;
}

export const RealTimeCostsChart: React.FC<RealTimeCostsChartProps> = ({ costs }) => {
  const maxCost = Math.max(costs.materialCost, costs.laborCost, costs.machineCost, 500000);

  const items = [
    { label: 'RAW MATERIAL (En-8D / SS 304)', value: costs.materialCost, color: 'bg-forge-steel', hex: '#475569' },
    { label: 'DIRECT SHOP OPERATOR LABOR', value: costs.laborCost, color: 'bg-slate-400', hex: '#94A3B8' },
    { label: 'SPINDLE MACHINE TIME (POWER & OVERHEAD)', value: costs.machineCost, color: 'bg-forge-orange', hex: '#F25C19' },
  ];

  return (
    <ChamferCard
      title="JOB DIRECT MANUFACTURING COSTS"
      tag="JOB ECONOMICS (INR)"
      action={
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-mono font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>UNIT_COST: VERIFIED (INR)</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cost Summary Header */}
        <div className="flex flex-wrap items-baseline justify-between border-b border-forge-aluminum/40 pb-3 gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider block">
              Active Batch Incurred Cost
            </span>
            <span className="font-display font-bold text-2xl text-forge-black">
              {formatINR(costs.totalCost, true)}
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider block">
              Verified Unit Cost
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="font-display font-bold text-xl text-forge-orange">
                {formatINR(costs.unitCostVerified, true)}
              </span>
              <span className="font-mono text-[11px] text-forge-steel font-medium">
                / PIECE
              </span>
            </div>
          </div>
        </div>

        {/* Clean Bar Visualization */}
        <div className="space-y-3 pt-1">
          {items.map((item, idx) => {
            const percentage = (item.value / maxCost) * 100;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex flex-wrap justify-between items-center text-xs font-mono gap-1">
                  <span className="text-forge-steel text-[11px] tracking-wide">
                    {item.label}
                  </span>
                  <span className="font-bold text-forge-black text-[12px]">
                    {formatINR(item.value)}
                  </span>
                </div>
                {/* Bar Track */}
                <div 
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={maxCost}
                  aria-label={`${item.label}: ${formatINR(item.value)}`}
                  className="h-4 bg-forge-alabaster border border-forge-aluminum relative overflow-hidden flex items-center"
                >
                  <AnimatedHorizontalBar
                    widthPercent={percentage}
                    delay={idx * 0.08}
                    colorClass={item.color}
                  />
                  <span className="absolute right-2 font-mono text-[9px] text-forge-steel font-semibold pointer-events-none z-10">
                    {((item.value / costs.totalCost) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote definition */}
        <div className="pt-2 text-[10px] font-mono text-forge-steel border-t border-forge-aluminum/30 flex flex-col sm:flex-row justify-between gap-1">
          <span>* Machine time billed @ ₹3,200/hr spindle rate</span>
          <span className="text-forge-black font-semibold">TOLERANCE: CLASS 1 ISO</span>
        </div>
      </div>
    </ChamferCard>
  );
};
