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
        {/* Active Production Item (Featured prominently) */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Inspect active work order ${currentJob.orderNumber}: ${currentJob.partName}`}
          onClick={() => onSelectJob(currentJob.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectJob(currentJob.id);
            }
          }}
          className="p-3.5 bg-forge-alabaster border border-forge-aluminum space-y-3 cursor-pointer hover:border-forge-orange transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

            <div className="text-left md:text-right font-mono text-[11px] text-forge-steel flex-shrink-0">
              <div>SPINDLE: <strong className="text-forge-black">{currentJob.targetMachineId}</strong></div>
              <div>EST DISPATCH: <strong className="text-forge-black">{currentJob.estCompletion}</strong></div>
            </div>
          </div>

          {/* Progress bar with numerical clarity */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center font-mono text-[11px]">
              <span className="text-forge-steel font-semibold truncate max-w-[200px]">
                {currentJob.currentOperation}
              </span>
              <span className="font-bold text-amber-950 bg-amber-50 px-1 py-0.2 border border-amber-300">
                {currentJob.progressPercent}% PROGRESS ({currentJob.quantityCompleted} / {currentJob.quantityTarget} PCS)
              </span>
            </div>
            <div 
              role="progressbar"
              aria-valuenow={currentJob.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Order ${currentJob.orderNumber} completion progress: ${currentJob.progressPercent}%`}
              className="h-2.5 bg-white border border-forge-aluminum relative overflow-hidden"
            >
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

          <div className="flex items-center justify-between text-[10px] font-mono text-forge-steel pt-1 border-t border-forge-aluminum/30">
            <span className="flex items-center gap-1">
              <PlayCircle className="w-3 h-3 text-emerald-600" aria-hidden="true" /> Live machining telemetry streaming
            </span>
            <span className="font-bold text-forge-orange hover:underline flex items-center gap-0.5">
              INSPECT BATCH <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* Secondary Execution Queue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Next Queued Order */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Inspect queued order ${nextJob.orderNumber}: ${nextJob.partName}`}
            onClick={() => onSelectJob(nextJob.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectJob(nextJob.id);
              }
            }}
            className="p-3 bg-white border border-forge-aluminum hover:border-forge-steel transition-all space-y-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] px-1.5 py-0.2 bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold uppercase">
                NEXT QUEUED
              </span>
              <span className="font-mono text-[10px] text-forge-steel">
                FOR {nextJob.targetMachineId}
              </span>
            </div>

            <div>
              <span className="font-mono text-xs font-bold text-forge-black block">
                {nextJob.orderNumber}
              </span>
              <span className="font-sans text-xs text-forge-black font-semibold truncate block">
                {nextJob.partName}
              </span>
              <span className="font-mono text-[10px] text-forge-steel">
                {nextJob.customerName || nextJob.customerCode} • {nextJob.quantityTarget} Pcs
              </span>
            </div>

            <div className="pt-2 border-t border-forge-aluminum/40 flex justify-between items-center text-[10px] font-mono text-forge-steel">
              <span>EST START: 14:15 IST</span>
              <span className="text-forge-orange font-bold">VIEW SETUP</span>
            </div>
          </div>

          {/* Delayed / Attention Order */}
          {delayedJob ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={`Inspect delayed order ${delayedJob.orderNumber}: ${delayedJob.partName}`}
              onClick={() => onSelectJob(delayedJob.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectJob(delayedJob.id);
                }
              }}
              className="p-3 bg-amber-50/40 border border-amber-300 hover:border-amber-500 transition-all space-y-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] px-1.5 py-0.2 bg-amber-100 border border-amber-400 text-amber-950 font-bold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" aria-hidden="true" />
                  ON HOLD / DELAYED
                </span>
                <span className="font-mono text-[10px] text-amber-900 font-semibold">
                  {delayedJob.targetMachineId}
                </span>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-forge-black block">
                  {delayedJob.orderNumber}
                </span>
                <span className="font-sans text-xs text-forge-black font-semibold truncate block">
                  {delayedJob.partName}
                </span>
                <span className="font-mono text-[10px] text-forge-steel">
                  Waiting on tool insert change (Sourav Das)
                </span>
              </div>

              <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-[10px] font-mono">
                <span className="text-amber-900 font-bold">+45m variance</span>
                <span className="text-forge-orange font-bold">RESOLVE</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white border border-forge-aluminum flex items-center justify-center font-mono text-xs text-forge-steel">
              No orders currently delayed on shop floor.
            </div>
          )}
        </div>
      </div>
    </ChamferCard>
  );
};
