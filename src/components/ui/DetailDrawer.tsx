import React, { useEffect } from 'react';
import { X, Cpu, Workflow, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Machine, Job } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ShiftTimeline } from './ShiftTimeline';
import { LinearGauge } from './GaugeIndicator';
import { OeeComponentBreakdown } from './OeeComponentBreakdown';
import { OperationFlowBar } from './OperationFlowBar';
import { formatINR } from '../../utils/formatters';
import { evaluateTelemetryFreshness, calculateShiftDurations } from '../../utils/telemetry';

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

  // Telemetry freshness & shift durations
  const freshness = machine
    ? evaluateTelemetryFreshness(machine.telemetryAgeSeconds, machine.telemetryTimestamp)
    : null;

  const shiftDurations = machine ? calculateShiftDurations(machine.stateHistory) : null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-heading"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-full sm:max-w-xl lg:max-w-2xl bg-white border-l border-forge-aluminum h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-forge-aluminum flex items-center justify-between bg-forge-alabaster gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-forge-black text-white flex-shrink-0" aria-hidden="true">
              {machine ? <Cpu className="w-4 h-4 text-forge-orange" /> : <Workflow className="w-4 h-4 text-forge-orange" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider font-semibold block">
                  {machine ? 'SPINDLE TELEMETRY INSPECTOR' : 'WORK ORDER DETAIL'}
                </span>
                {freshness && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 border font-bold ${freshness.badgeBg} ${freshness.badgeText} ${freshness.badgeBorder}`}>
                    {freshness.label} • {freshness.ageText}
                  </span>
                )}
              </div>
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
              {/* SECTION 1: Machine Overview & Telemetry Freshness */}
              <div className="border border-forge-aluminum bg-white p-3.5 space-y-2.5 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between border-b border-forge-aluminum/50 pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-forge-black">{machine.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-forge-steel">
                      {machine.axisCount}-AXIS CNC
                    </span>
                    <StatusBadge type="machine" status={machine.state} size="sm" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-forge-steel uppercase block">PACKET AGE</span>
                    <span className="font-bold text-forge-black">{machine.telemetryTimestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">OPERATOR</span>
                    <strong className="text-forge-black">{machine.operator}</strong>
                  </div>
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">ACTIVE JOB</span>
                    <strong className="text-forge-orange truncate block">
                      {machine.currentJobId ? machine.currentJobId : '— NONE (IDLE) —'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">LAST STATE SHIFT</span>
                    <span className="text-forge-black">{machine.lastStateChange}</span>
                  </div>
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">SECTION</span>
                    <span className="text-forge-black">{machine.section || 'General CNC'}</span>
                  </div>
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">TARGET OEE</span>
                    <span className="text-forge-black font-semibold">{machine.targetOee || 85}%</span>
                  </div>
                  <div>
                    <span className="text-forge-steel block text-[9px] uppercase">STREAM PROTOCOL</span>
                    <span className="text-forge-black">MTConnect v2.0</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Operational Diagnosis (Phase 5 Section 5) */}
              {machine.diagnosis && (
                <div className={`p-4 border font-mono text-xs space-y-2.5 ${
                  machine.diagnosis.severity === 'CRITICAL'
                    ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                    : machine.diagnosis.severity === 'WARNING'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-forge-alabaster border-forge-aluminum text-forge-black'
                }`}>
                  <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                    {machine.diagnosis.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
                    ) : machine.diagnosis.severity === 'WARNING' ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      OPERATIONAL DIAGNOSIS & ACTION PLAN
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="font-bold uppercase text-[10px] text-forge-steel block">WHAT IS HAPPENING?</span>
                      <p className="font-sans leading-relaxed text-forge-black">{machine.diagnosis.issue}</p>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-[10px] text-forge-steel block">WHY DOES IT MATTER?</span>
                      <p className="font-sans leading-relaxed text-forge-black">{machine.diagnosis.whyItMatters}</p>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-[10px] text-forge-steel block">WHAT NEEDS ATTENTION?</span>
                      <p className="font-sans leading-relaxed text-forge-black">{machine.diagnosis.needsAttention}</p>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-[10px] text-forge-steel block">RECOMMENDED NEXT INVESTIGATION</span>
                      <p className="font-sans font-semibold text-forge-black bg-white/70 p-2 border border-black/10">
                        {machine.diagnosis.recommendedInvestigation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: Shift Timeline Duration Breakdown (Phase 5 Section 3) */}
              <div className="border border-forge-aluminum p-3.5 space-y-2.5 bg-white font-mono text-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-forge-black uppercase">
                    8-HOUR SHIFT 01 TIMELINE (06:00 - 14:00 IST)
                  </span>
                  <span className="text-forge-steel">
                    Spindle Uptime: <strong className="text-forge-black">{machine.uptimeHoursToday}h</strong>
                  </span>
                </div>

                <ShiftTimeline intervals={machine.stateHistory} compact={false} />

                {/* Duration breakdown summary */}
                {shiftDurations && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-forge-aluminum/40 text-[10px]">
                    <div className="p-1.5 bg-emerald-50 border border-emerald-300">
                      <span className="text-emerald-800 uppercase block font-semibold">Running</span>
                      <strong className="text-emerald-950 text-xs">{shiftDurations.runningFormatted}</strong>
                    </div>
                    <div className="p-1.5 bg-blue-50 border border-blue-300">
                      <span className="text-blue-800 uppercase block font-semibold">Setup</span>
                      <strong className="text-blue-950 text-xs">{shiftDurations.setupFormatted}</strong>
                    </div>
                    <div className="p-1.5 bg-amber-50 border border-amber-300">
                      <span className="text-amber-800 uppercase block font-semibold">Idle</span>
                      <strong className="text-amber-950 text-xs">{shiftDurations.idleFormatted}</strong>
                    </div>
                    <div className="p-1.5 bg-slate-100 border border-slate-300">
                      <span className="text-slate-800 uppercase block font-semibold">Stop / Alarm</span>
                      <strong className="text-slate-950 text-xs">
                        {shiftDurations.alarmMinutes > 0 ? shiftDurations.alarmFormatted : shiftDurations.stoppedFormatted}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Performance Metrics & OEE Breakdown (Phase 5 Section 4) */}
              <OeeComponentBreakdown
                oee={machine.oee}
                targetOee={machine.targetOee || 85.0}
                title={`${machine.id} OVERALL EQUIPMENT EFFECTIVENESS (OEE)`}
                showFormula={true}
              />

              {/* SECTION 5: Real-time Telemetry Sensor Channels */}
              <div className="border border-forge-aluminum p-4 space-y-3 bg-white font-mono text-xs">
                <div className="flex items-center justify-between border-b border-forge-aluminum/40 pb-2">
                  <span className="font-bold text-forge-black uppercase text-xs">
                    LIVE SPINDLE SENSOR CHANNELS
                  </span>
                  <span className="text-[10px] text-forge-steel uppercase">HOWRAH CELL</span>
                </div>

                <div className="space-y-2.5">
                  <LinearGauge
                    label="SPINDLE ROTATION SPEED"
                    value={machine.spindleRpm}
                    max={machine.maxRpm || 20000}
                    unit="RPM"
                    nominalTarget={12000}
                    color={machine.state === 'RUNNING' ? 'emerald' : 'slate'}
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

                {/* Cycle Time & Batch Progress Strip */}
                <div className="pt-2 border-t border-forge-aluminum/40 text-[11px] space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Cycle Time (Actual / Target):</span>
                    <span className="font-bold text-forge-black">
                      {machine.actualCycleTimeSec ? `${machine.actualCycleTimeSec}s` : '0s'} / {machine.targetCycleTimeSec ? `${machine.targetCycleTimeSec}s` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
                    <span className="text-forge-steel">Batch Production Count:</span>
                    <span className="font-bold text-forge-black">
                      {machine.partsCompleted || 0} / {machine.partsPlanned || '—'} units
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-forge-steel">Estimated Job Completion:</span>
                    <span className="font-bold text-forge-black">{machine.estJobCompletion || '—'}</span>
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
                  ORDER SPECIFICATIONS
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
                  <span className="font-bold text-forge-black">{formatINR(job.verifiedUnitCost, true)} / piece</span>
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
