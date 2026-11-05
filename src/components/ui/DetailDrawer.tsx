import React, { useEffect } from 'react';
import { X, Cpu, Workflow } from 'lucide-react';
import { Machine, Job } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ShiftTimeline } from './ShiftTimeline';
import { LinearGauge } from './GaugeIndicator';
import { OeeComponentBreakdown } from './OeeComponentBreakdown';
import { OperationFlowBar } from './OperationFlowBar';
import { formatINR } from '../../utils/formatters';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  job?: Job | null;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  machine,
  job
}) => {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || (!machine && !job)) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-heading"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-full sm:max-w-xl bg-white border-l border-forge-aluminum h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-forge-aluminum flex items-center justify-between bg-forge-alabaster gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-forge-black text-white flex-shrink-0" aria-hidden="true">
              {machine ? <Cpu className="w-4 h-4 text-forge-orange" /> : <Workflow className="w-4 h-4 text-forge-orange" />}
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider font-semibold block">
                {machine ? 'SPINDLE TELEMETRY INSPECTOR' : 'WORK ORDER DETAIL'}
              </span>
              <h2 id="detail-drawer-heading" className="font-display font-bold text-base text-forge-black truncate">
                {machine ? `${machine.id} • ${machine.name}` : `${job?.orderNumber} • ${job?.partName}`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail inspector"
            className="p-1.5 hover:bg-white border border-forge-aluminum text-forge-steel hover:text-forge-black transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
            title="Close Inspector (Esc)"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {machine && (
            <div className="space-y-4">
              {/* State & Connection Summary */}
              <div className="flex items-center justify-between p-3 bg-forge-alabaster border border-forge-aluminum">
                <div>
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Machine State</span>
                  <StatusBadge type="machine" status={machine.state} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">MTConnect Stream</span>
                  <StatusBadge type="connection" status={machine.connectionState} />
                </div>
              </div>

              {/* 8-Hour State Timeline (Full Shift Inspection) */}
              <div className="border border-forge-aluminum p-3.5 space-y-2 bg-white">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-forge-black uppercase">
                    8-HOUR SHIFT 01 TIMELINE (06:00 - 14:00 IST)
                  </span>
                  <span className="text-forge-steel">
                    Uptime: <strong className="text-forge-black">{machine.uptimeHoursToday}h</strong>
                  </span>
                </div>
                <ShiftTimeline intervals={machine.stateHistory} compact={false} />
              </div>

              {/* Graphical OEE Component Breakdown */}
              <OeeComponentBreakdown
                oee={machine.oee}
                title={`${machine.id} GROUNDED OEE BREAKDOWN`}
                showFormula={true}
              />

              {/* Real-time Telemetry Linear Gauges */}
              <div className="border border-forge-aluminum p-4 space-y-3 bg-white">
                <span className="font-mono text-xs font-bold text-forge-black uppercase block border-b border-forge-aluminum/40 pb-2">
                  LIVE SPINDLE SENSOR CHANNELS (HOWRAH CELL)
                </span>

                <div className="space-y-2.5">
                  <LinearGauge
                    label="SPINDLE ROTATION SPEED"
                    value={machine.spindleRpm}
                    max={machine.maxRpm || 20000}
                    unit="RPM"
                    nominalTarget={12000}
                    color={machine.state === 'RUNNING' ? 'orange' : 'slate'}
                  />

                  <LinearGauge
                    label="AXIS FEED RATE"
                    value={machine.feedRateMmpm}
                    max={machine.maxFeedRate || 6000}
                    unit="mm/min"
                    nominalTarget={3500}
                    color="blue"
                  />

                  <LinearGauge
                    label="FEED OVERRIDE POTENTIOMETER"
                    value={machine.feedOverridePct}
                    max={120}
                    unit="%"
                    nominalTarget={100}
                    color={machine.feedOverridePct >= 95 ? 'emerald' : 'orange'}
                  />
                </div>

                <div className="pt-2 border-t border-forge-aluminum/40 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Machine Section:</span>
                    <span className="font-bold text-forge-black">{machine.section || 'CNC Machining Cell'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Current Operator:</span>
                    <span className="font-bold text-forge-black">{machine.operator}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Active Work Order:</span>
                    <span className="font-bold text-forge-orange">
                      {machine.currentJobId ? machine.currentJobId : '— No Active Job (Idle) —'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Axis Configuration:</span>
                    <span className="font-bold text-forge-black">{machine.axisCount}-Axis CNC Cell</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-forge-steel">Last Telemetry Packet:</span>
                    <span className="font-bold text-forge-black">{machine.telemetryTimestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {job && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-forge-alabaster border border-forge-aluminum">
                <div>
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Workflow State</span>
                  <StatusBadge type="production" status={job.state} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Dispatch Priority</span>
                  <span className="font-mono text-xs font-bold text-amber-950 bg-amber-50 px-1.5 py-0.5 border border-amber-300">{job.priority}</span>
                </div>
              </div>

              {/* Part & Material Info */}
              <div className="border border-forge-aluminum p-4 space-y-2 font-mono text-xs bg-white">
                <span className="font-mono text-xs font-bold text-forge-black uppercase block border-b border-forge-aluminum/40 pb-2">
                  ORDER SPECIFICATIONS (INDIAN ENGINEERING)
                </span>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                  <span className="text-forge-steel">Part Number:</span>
                  <span className="font-bold text-forge-black">{job.partNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                  <span className="text-forge-steel">Material Grade:</span>
                  <span className="font-bold text-forge-black">{job.material}</span>
                </div>
                {job.customerName && (
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Customer:</span>
                    <span className="font-bold text-forge-black">{job.customerName}</span>
                  </div>
                )}
                {job.hsnCode && (
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">HSN Classification:</span>
                    <span className="font-bold text-forge-black">{job.hsnCode}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                  <span className="text-forge-steel">Target Spindle:</span>
                  <span className="font-bold text-forge-black">{job.targetMachineId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                  <span className="text-forge-steel">Batch Quantity:</span>
                  <span className="font-bold text-forge-black">{job.quantityCompleted} / {job.quantityTarget} pieces</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-forge-steel">Verified Unit Cost:</span>
                  <span className="font-bold text-forge-orange">{formatINR(job.verifiedUnitCost, true)} / piece</span>
                </div>
              </div>

              {/* Graphical Operation Routing Flow */}
              {job.operations && job.operations.length > 0 && (
                <div className="border border-forge-aluminum p-4 space-y-3 bg-white">
                  <span className="font-mono text-xs font-bold text-forge-black uppercase block border-b border-forge-aluminum/40 pb-2">
                    ROUTING PROCESS FLOW (HOWRAH CELL)
                  </span>
                  <OperationFlowBar
                    operations={job.operations}
                    currentOperationName={job.currentOperation}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-forge-aluminum bg-forge-alabaster flex justify-between items-center font-mono text-[10px]">
          <span className="text-forge-steel">
            SHREE GANESH PRECISION • MES v1.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-forge-black text-white text-xs font-mono font-semibold uppercase hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
