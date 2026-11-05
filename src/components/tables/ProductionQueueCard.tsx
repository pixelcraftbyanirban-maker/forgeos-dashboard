import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Job } from '../../types';
import { PlayCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface ProductionQueueCardProps {
  currentJob: Job;
  nextJob: Job;
  delayedJob?: Job;
  onSelectJob: (jobId: string) => void;
}

export const ProductionQueueCard: React.FC<ProductionQueueCardProps> = ({
  currentJob,
  nextJob,
  delayedJob,
  onSelectJob
}) => {
  return (
    <ChamferCard
      title="OPERATIONAL EXECUTION & QUEUE"
      tag="CURRENT JOBS"
      action={
        <span className="font-mono text-[10px] text-forge-steel">
          SHOP FLOOR LIVE
        </span>
      }
    >
      <div className="space-y-4">
        {/* Active Production Item (Featured prominently like Page 5/22) */}
        <div className="p-3.5 bg-forge-alabaster border border-forge-aluminum space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-forge-orange text-white font-bold tracking-wider uppercase">
                CURRENT PRODUCTION
              </span>
              <span className="font-mono text-xs font-bold text-forge-black">
                {currentJob.orderNumber}
              </span>
            </div>
            <StatusBadge type="production" status={currentJob.state} size="sm" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
            <div>
              <span className="font-display font-semibold text-sm text-forge-black block">
                {currentJob.partName}
              </span>
              <span className="font-mono text-[11px] text-forge-steel">
                MATERIAL: <strong className="text-forge-black">{currentJob.material}</strong> • TARGET: <strong className="text-forge-black">{currentJob.quantityTarget} UNITS</strong>
              </span>
            </div>

            <div className="text-left md:text-right font-mono text-[11px] text-forge-steel">
              <div>SPINDLE: <strong className="text-forge-black">{currentJob.targetMachineId}</strong></div>
              <div>COMPLETION: <strong className="text-forge-black">{currentJob.estCompletion.split(' ')[1]}</strong></div>
            </div>
          </div>

          {/* Precision Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-mono text-[11px]">
              <span className="text-forge-steel">
                {currentJob.currentOperation}
              </span>
              <span className="font-bold text-forge-orange">
                {currentJob.progressPercent}% COMPLETE ({currentJob.quantityCompleted}/{currentJob.quantityTarget})
              </span>
            </div>
            <div className="h-2.5 bg-white border border-forge-aluminum relative overflow-hidden">
              <div
                className="h-full bg-forge-orange transition-all duration-500"
                style={{ width: `${currentJob.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two Column Layout: Next in Queue & Delayed/Attention Job */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Next Queue Card */}
          <div className="p-3 bg-white border border-forge-aluminum space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase text-forge-steel font-bold flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                NEXT IN QUEUE
              </span>
              <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2">
                STAGED
              </span>
            </div>

            <div>
              <div className="font-mono text-xs font-bold text-forge-black">
                {nextJob.orderNumber}
              </div>
              <div className="text-xs text-forge-steel font-sans truncate">
                {nextJob.partName}
              </div>
              <div className="font-mono text-[10px] text-forge-steel mt-1">
                MAT: <span className="text-forge-black">{nextJob.material}</span> • QTY: <span className="text-forge-black">{nextJob.quantityTarget}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-forge-aluminum/40 flex items-center justify-between text-[10px] font-mono text-forge-steel">
              <span>TARGET: {nextJob.targetMachineId}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                EST. {nextJob.plannedStart.split(' ')[1]}
              </span>
            </div>
          </div>

          {/* Attention / Delayed Job Card (from Page 5 mockup) */}
          {delayedJob && (
            <div className="p-3 bg-amber-50/50 border border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-amber-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  REQUIRES ATTENTION
                </span>
                <span className="font-mono text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-1 py-0.2 font-semibold">
                  DELAYED
                </span>
              </div>

              <div>
                <div className="font-mono text-xs font-bold text-forge-black">
                  {delayedJob.orderNumber}
                </div>
                <div className="text-xs text-forge-steel font-sans truncate">
                  {delayedJob.partName}
                </div>
                <div className="font-mono text-[10px] text-amber-900 mt-1">
                  MAT: <span className="font-semibold">{delayedJob.material}</span> • QTY: <span className="font-semibold">{delayedJob.quantityTarget}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[10px] font-mono text-amber-800">
                <span>MACHINE: {delayedJob.targetMachineId}</span>
                <button
                  onClick={() => onSelectJob(delayedJob.id)}
                  className="font-bold flex items-center gap-0.5 hover:underline text-forge-black"
                >
                  VIEW LOG <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChamferCard>
  );
};
