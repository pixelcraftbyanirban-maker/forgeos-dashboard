import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { OperationFlowBar } from '../ui/OperationFlowBar';
import { Job } from '../../types';
import { PlayCircle, AlertTriangle, ArrowRight } from 'lucide-react';

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
        <span className="font-mono text-[10px] text-forge-steel font-semibold">
          SHOP FLOOR LIVE
        </span>
      }
    >
      <div className="space-y-4">
        {/* Active Production Item (Featured prominently like Page 5/22) */}
        <div
          onClick={() => onSelectJob(currentJob.id)}
          className="p-3.5 bg-forge-alabaster border border-forge-aluminum space-y-3 cursor-pointer hover:border-forge-orange transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-forge-orange text-white font-bold tracking-wider uppercase">
                ACTIVE IN SPINDLE
              </span>
              <span className="font-mono text-xs font-bold text-forge-black">
                {currentJob.orderNumber}
              </span>
              {currentJob.customerName ? (
                <span className="font-mono text-[10px] px-1 bg-white border border-forge-aluminum text-forge-black font-semibold">
                  {currentJob.customerName}
                </span>
              ) : currentJob.customerCode ? (
                <span className="font-mono text-[10px] px-1 bg-white border border-forge-aluminum text-forge-steel">
                  {currentJob.customerCode}
                </span>
              ) : null}
            </div>
            <StatusBadge type="production" status={currentJob.state} size="sm" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-display font-bold text-base text-forge-black block">
                {currentJob.partName}
              </span>
              <span className="font-mono text-[11px] text-forge-steel">
                PART NO: <strong className="text-forge-black">{currentJob.partNumber}</strong> • MATERIAL: <strong className="text-forge-black">{currentJob.material}</strong>
                {currentJob.hsnCode && <span> • HSN: <strong className="text-forge-black">{currentJob.hsnCode}</strong></span>}
              </span>
            </div>

            <div className="text-left md:text-right font-mono text-[11px] text-forge-steel">
              <div>SPINDLE: <strong className="text-forge-black">{currentJob.targetMachineId}</strong></div>
              <div>EST DISPATCH: <strong className="text-forge-black">{currentJob.estCompletion}</strong></div>
            </div>
          </div>

          {/* Progress bar with numerical clarity */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center font-mono text-[11px]">
              <span className="text-forge-steel font-semibold">
                {currentJob.currentOperation}
              </span>
              <span className="font-bold text-forge-orange">
                {currentJob.progressPercent}% PROGRESS ({currentJob.quantityCompleted} / {currentJob.quantityTarget} PIECES)
              </span>
            </div>
            <div className="h-2.5 bg-white border border-forge-aluminum relative overflow-hidden">
              <div
                className="h-full bg-forge-orange transition-all duration-500"
                style={{ width: `${currentJob.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Embedded Visual Routing Process Flow */}
          {currentJob.operations && currentJob.operations.length > 0 && (
            <div className="pt-2 border-t border-forge-aluminum/50">
              <OperationFlowBar
                operations={currentJob.operations}
                currentOperationName={currentJob.currentOperation}
              />
            </div>
          )}
        </div>

        {/* Two Column Layout: Next in Queue & Delayed/Attention Job */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Next Queue Card */}
          <div
            onClick={() => onSelectJob(nextJob.id)}
            className="p-3 bg-white border border-forge-aluminum space-y-2 cursor-pointer hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-forge-steel font-bold flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                  NEXT IN QUEUE
                </span>
                <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2">
                  STAGED
                </span>
              </div>

              <div className="mt-2">
                <div className="font-mono text-xs font-bold text-forge-black">
                  {nextJob.orderNumber}
                </div>
                <div className="text-xs font-semibold text-forge-black font-sans truncate">
                  {nextJob.partName}
                </div>
                <div className="text-[10px] text-forge-steel font-mono">
                  {nextJob.material} • {nextJob.quantityTarget} Units
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-forge-aluminum/40 flex items-center justify-between font-mono text-[10px] text-forge-steel">
              <span>TARGET: {nextJob.targetMachineId}</span>
              <span className="text-forge-black font-bold flex items-center gap-1">
                VIEW ORDER <ArrowRight className="w-3 h-3 text-forge-orange" />
              </span>
            </div>
          </div>

          {/* Delayed / Attention Job Card */}
          {delayedJob ? (
            <div
              onClick={() => onSelectJob(delayedJob.id)}
              className="p-3 bg-amber-50/40 border border-amber-300 space-y-2 cursor-pointer hover:border-amber-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-amber-900 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    DEVIATION ATTENTION
                  </span>
                  <StatusBadge type="production" status={delayedJob.state} size="sm" />
                </div>

                <div className="mt-2">
                  <div className="font-mono text-xs font-bold text-forge-black">
                    {delayedJob.orderNumber}
                  </div>
                  <div className="text-xs font-semibold text-forge-black font-sans truncate">
                    {delayedJob.partName}
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono">
                    {delayedJob.currentOperation}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 flex items-center justify-between font-mono text-[10px] text-amber-900">
                <span>DELAY: +35 MIN</span>
                <span className="font-bold text-forge-orange flex items-center gap-1">
                  INVESTIGATE <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white border border-forge-aluminum flex items-center justify-center font-mono text-xs text-forge-steel">
              NO PRODUCTION DEVIATIONS
            </div>
          )}
        </div>
      </div>
    </ChamferCard>
  );
};
