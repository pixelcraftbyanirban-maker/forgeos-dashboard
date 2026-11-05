import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { RealTimeCosts } from '../../types';
import { CheckCircle2 } from 'lucide-react';

interface RealTimeCostsChartProps {
  costs: RealTimeCosts;
}

export const RealTimeCostsChart: React.FC<RealTimeCostsChartProps> = ({ costs }) => {
  const maxCost = Math.max(costs.materialCost, costs.laborCost, costs.machineCost, 1600);

  const items = [
    { label: 'MATERIAL COST', value: costs.materialCost, color: 'bg-forge-steel', hex: '#475569' },
    { label: 'LABOR COST', value: costs.laborCost, color: 'bg-forge-aluminum', hex: '#CBD5E1' },
    { label: 'MACHINE TIME', value: costs.machineCost, color: 'bg-forge-orange', hex: '#F25C19' },
  ];

  return (
    <ChamferCard
      title="REAL-TIME COSTS"
      tag="JOB ECONOMICS"
      action={
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>UNIT_COST: VERIFIED</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cost Summary Header */}
        <div className="flex items-baseline justify-between border-b border-forge-aluminum/40 pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider block">
              Active Job Total Incurred
            </span>
            <span className="font-display font-bold text-2xl text-forge-black">
              ${costs.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider block">
              Calculated Unit Cost
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="font-display font-bold text-xl text-forge-orange">
                ${costs.unitCostVerified.toFixed(2)}
              </span>
              <span className="font-mono text-[11px] text-forge-steel font-medium">
                / UNIT
              </span>
            </div>
          </div>
        </div>

        {/* Clean Bar Visualization */}
        <div className="space-y-3 pt-1">
          {items.map((item) => {
            const percentage = (item.value / maxCost) * 100;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-forge-steel text-[11px] tracking-wide">
                    {item.label}
                  </span>
                  <span className="font-bold text-forge-black text-[12px]">
                    ${item.value.toLocaleString()}
                  </span>
                </div>
                {/* Bar Track */}
                <div className="h-4 bg-forge-alabaster border border-forge-aluminum relative overflow-hidden flex items-center">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="absolute right-2 font-mono text-[9px] text-forge-steel">
                    {((item.value / costs.totalCost) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote definition */}
        <div className="pt-2 text-[10px] font-mono text-forge-steel border-t border-forge-aluminum/30 flex justify-between">
          <span>* Machine time billed @ $95/hr standard spindle rate</span>
          <span className="text-forge-black font-semibold">TOLERANCE: CLASS 1</span>
        </div>
      </div>
    </ChamferCard>
  );
};
