import React, { useState } from 'react';
import { Machine, Job, ProductionState, MachineState } from '../../types';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Boxes, 
  RotateCcw, 
  Plus, 
  Minus, 
  FileCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { ModalMotion, MotionButton } from '../../motion';

interface OperatorConsolePageProps {
  machines: Machine[];
  jobs: Job[];
  onSelectMachine?: (machineId: string) => void;
}

export const OperatorConsolePage: React.FC<OperatorConsolePageProps> = ({
  machines,
  jobs,
  onSelectMachine
}) => {
  // Currently assigned machine in console
  const [selectedMachineId, setSelectedMachineId] = useState<string>('VMC-01');
  const [operatorName, setOperatorName] = useState<string>('Rahul Das');

  // Active machine & job
  const machine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const activeJob = jobs.find((j) => j.targetMachineId === machine.id && j.state === 'IN_PROGRESS') ||
    jobs.find((j) => j.id === machine.currentJobId) || jobs[0];

  // Dynamic interactive operational state
  const [localJobState, setLocalJobState] = useState<ProductionState>(activeJob.state);
  const [localMachineState, setLocalMachineState] = useState<MachineState>(machine.state);
  const [completedQty, setCompletedQty] = useState<number>(machine.partsCompleted || activeJob.quantityCompleted || 320);
  const [scrappedQty, setScrappedQty] = useState<number>(activeJob.quantityScrapped || 2);
  const [materialConfirmed, setMaterialConfirmed] = useState<boolean>(true);
  const [activeDowntimeReason, setActiveDowntimeReason] = useState<string | null>(null);

  // Modal dialog states
  const [actionModal, setActionModal] = useState<
    'DOWNTIME' | 'DEFECT' | 'MAINTENANCE' | 'TOOL_SWAP' | 'COMPLETE' | null
  >(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Downtime reason form
  const [selectedDowntimeReason, setSelectedDowntimeReason] = useState<string>('CHIP_SWARF_CLEARANCE');
  const [defectReason, setDefectReason] = useState<string>('DIMENSIONAL_OOT');

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const plannedQty = machine.partsPlanned || activeJob.quantityTarget || 500;
  const remainingQty = Math.max(0, plannedQty - completedQty);
  const progressPct = plannedQty > 0 ? Math.round((completedQty / plannedQty) * 100) : 0;

  // 1. Start Work Order
  const handleStartOrder = () => {
    setLocalJobState('IN_PROGRESS');
    setLocalMachineState('RUNNING');
    setActiveDowntimeReason(null);
    showFeedback(`Work order ${activeJob.orderNumber} STARTED on ${machine.id}. Spindle interlock nominal.`);
  };

  // 2. Pause Work Order
  const handlePauseOrder = () => {
    setLocalJobState('ON_HOLD');
    setLocalMachineState('IDLE');
    showFeedback(`Work order ${activeJob.orderNumber} PAUSED. Spindle idling.`);
  };

  // 3. Resume Work Order
  const handleResumeOrder = () => {
    setLocalJobState('IN_PROGRESS');
    setLocalMachineState('RUNNING');
    setActiveDowntimeReason(null);
    showFeedback(`Work order ${activeJob.orderNumber} RESUMED.`);
  };

  // 4. Record Completed Quantity
  const handleAddCompleted = (delta: number) => {
    const updated = Math.min(plannedQty, completedQty + delta);
    setCompletedQty(updated);
    showFeedback(`Recorded +${delta} completed parts. Total completed: ${updated} pcs.`);
  };

  // 6 & 7. Report Downtime with Reason
  const handleSubmitDowntime = () => {
    setLocalMachineState('STOPPED');
    setLocalJobState('ON_HOLD');
    setActiveDowntimeReason(selectedDowntimeReason);
    showFeedback(`Downtime reported: ${selectedDowntimeReason.replace(/_/g, ' ')}. Supervisor notified.`);
    setActionModal(null);
  };

  // 8. Report Defect & Record Scrap
  const handleSubmitDefect = () => {
    setScrappedQty((prev) => prev + 1);
    showFeedback(`Quality deviation logged: ${defectReason.replace(/_/g, ' ')}. Scrapped part recorded and QA Lead Priya Sharma notified.`);
    setActionModal(null);
  };

  // 9. Request Maintenance
  const handleRequestMaintenance = () => {
    showFeedback(`Maintenance request dispatched to Vikram Singh (Maintenance Tech) for ${machine.id}.`);
    setActionModal(null);
  };

  // 10. Confirm Material
  const handleConfirmMaterial = () => {
    setMaterialConfirmed(true);
    showFeedback(`Billet material staging confirmed at spindle ${machine.id} bed.`);
  };

  // 11. Tool Replacement
  const handleConfirmToolSwap = () => {
    showFeedback(`Tool replacement recorded. Tool wear offset zeroed on CNC CNC controller.`);
    setActionModal(null);
  };

  // 12. Complete Work Order
  const handleCompleteOrder = () => {
    setLocalJobState('COMPLETED');
    setLocalMachineState('IDLE');
    showFeedback(`Work order ${activeJob.orderNumber} MARKED COMPLETE! Ready for CMM inspection.`);
    setActionModal(null);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Station Terminal Banner */}
      <div className="bg-forge-black text-white p-4 border border-forge-steel/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-forge-orange text-white">
            <Wrench className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-widest uppercase text-white">
                SHOP-FLOOR OPERATOR TERMINAL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-emerald-400 font-semibold">
                STATION ONLINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans">
              Optimized touch interface for shop-floor CNC machining terminals & rugged tablets.
            </p>
          </div>
        </div>

        {/* Machine & Operator Station Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right text-[11px]">
            <span className="text-zinc-400 block text-[9px] uppercase">SPINDLE STATION</span>
            <select
              value={selectedMachineId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedMachineId(newId);
                const m = machines.find((item) => item.id === newId);
                if (m) {
                  setLocalMachineState(m.state);
                  setOperatorName(m.operator);
                }
              }}
              aria-label="Select active spindle station"
              className="bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs font-mono text-white font-bold focus:outline-none focus:border-forge-orange"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right text-[11px]">
            <span className="text-zinc-400 block text-[9px] uppercase">OPERATOR</span>
            <span className="text-zinc-200 font-bold px-2 py-1 bg-zinc-900 border border-zinc-700 block">
              {operatorName}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Feedback Alert */}
      {feedbackMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="p-3.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-mono text-xs flex items-center gap-2 shadow-sm animate-in fade-in"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span className="font-bold">{feedbackMessage}</span>
        </div>
      )}

      {/* Active Downtime Alarm Callout */}
      {activeDowntimeReason && (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-500 text-rose-950 font-mono text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" aria-hidden="true" />
            <div>
              <span className="font-bold block uppercase">SPINDLE HALTED — ACTIVE DOWNTIME RECORDED</span>
              <span>Reason: {activeDowntimeReason.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartOrder}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
          >
            CLEAR & RESUME
          </button>
        </div>
      )}

      {/* Top 3-Column Operator Dashboard Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Machine Status & Spindle Telemetry */}
        <div className="lg:col-span-4 bg-white border border-forge-aluminum p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-forge-aluminum/50 pb-2">
            <div>
              <span className="text-[10px] text-forge-steel uppercase tracking-wider block">MACHINE ID</span>
              <strong className="text-xl font-display font-bold text-forge-black">{machine.id}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-forge-steel uppercase block">CURRENT STATE</span>
              <span className={`px-2 py-0.5 text-xs font-bold border uppercase inline-block ${
                localMachineState === 'RUNNING' ? 'bg-emerald-50 text-emerald-900 border-emerald-400' :
                localMachineState === 'SETUP' ? 'bg-blue-50 text-blue-900 border-blue-400' :
                localMachineState === 'IDLE' ? 'bg-amber-50 text-amber-950 border-amber-400' :
                localMachineState === 'ALARM' ? 'bg-rose-50 text-rose-950 border-rose-400' :
                'bg-slate-100 text-slate-800 border-slate-400'
              }`}>
                {localMachineState}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
              <span className="text-forge-steel">Machine Model:</span>
              <span className="font-bold text-forge-black truncate max-w-[170px]">{machine.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
              <span className="text-forge-steel">Spindle Rotation:</span>
              <span className="font-bold text-forge-black">
                {localMachineState === 'RUNNING' ? `${machine.spindleRpm.toLocaleString()} RPM` : '0 RPM (Stopped)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-forge-aluminum/20">
              <span className="text-forge-steel">Feed Override:</span>
              <span className="font-bold text-forge-black">{machine.feedOverridePct}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-forge-steel">Target Cycle Time:</span>
              <span className="font-bold text-forge-black">{machine.targetCycleTimeSec || 120}s / piece</span>
            </div>
          </div>

          {onSelectMachine && (
            <button
              type="button"
              onClick={() => onSelectMachine(machine.id)}
              className="w-full py-1.5 bg-forge-alabaster border border-forge-aluminum text-forge-black text-xs font-semibold uppercase hover:bg-white transition-colors flex items-center justify-center gap-1"
            >
              <span>View Full Inspector</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Center Column: Current Work Order & Batch Counters */}
        <div className="lg:col-span-8 bg-white border border-forge-aluminum p-4 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between border-b border-forge-aluminum/50 pb-2 gap-2">
            <div>
              <span className="text-[10px] text-forge-steel uppercase tracking-wider block font-semibold">
                ACTIVE JOB DISPATCH
              </span>
              <span className="text-lg font-display font-bold text-forge-black">
                {activeJob.orderNumber} • {activeJob.partName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold border uppercase ${
                localJobState === 'IN_PROGRESS' ? 'bg-orange-50 text-amber-950 border-orange-400' :
                localJobState === 'COMPLETED' ? 'bg-emerald-50 text-emerald-900 border-emerald-400' :
                'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                {localJobState.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold bg-amber-50 text-amber-950 px-1.5 py-0.5 border border-amber-300">
                {activeJob.priority}
              </span>
            </div>
          </div>

          {/* Large Touch-Target Quantity Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-forge-alabaster border border-forge-aluminum">
              <span className="text-[10px] text-forge-steel uppercase block">TARGET</span>
              <span className="font-display font-bold text-2xl text-forge-black">{plannedQty}</span>
              <span className="text-[9px] text-forge-steel block">pieces</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300">
              <span className="text-[10px] text-emerald-800 uppercase block font-semibold">COMPLETED</span>
              <span className="font-display font-bold text-2xl text-emerald-950">{completedQty}</span>
              <span className="text-[9px] text-emerald-800 block">pieces ({progressPct}%)</span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-300">
              <span className="text-[10px] text-rose-800 uppercase block font-semibold">REJECTED</span>
              <span className="font-display font-bold text-2xl text-rose-950">{scrappedQty}</span>
              <span className="text-[9px] text-rose-800 block">scrap parts</span>
            </div>

            <div className="p-3 bg-forge-alabaster border border-forge-aluminum">
              <span className="text-[10px] text-forge-steel uppercase block">REMAINING</span>
              <span className="font-display font-bold text-2xl text-forge-black">{remainingQty}</span>
              <span className="text-[9px] text-forge-steel block">to cut</span>
            </div>
          </div>

          {/* Graphical Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-forge-steel">
              <span>Production Schedule Adherence</span>
              <strong className="text-forge-black">{progressPct}% complete</strong>
            </div>
            <div className="h-3 bg-forge-alabaster border border-forge-aluminum overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operator Job Instructions & Material Staging Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Job Instructions */}
        <div className="lg:col-span-6 bg-white border border-forge-aluminum p-4 space-y-2.5 font-mono text-xs">
          <span className="font-bold text-forge-black uppercase text-xs block border-b border-forge-aluminum/40 pb-2 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-forge-orange" aria-hidden="true" />
            OPERATOR PROCESS INSTRUCTIONS (SOP)
          </span>

          <div className="space-y-2 font-sans text-xs text-forge-steel leading-relaxed">
            <div className="p-2 bg-forge-alabaster border border-forge-aluminum/60">
              <strong className="text-forge-black block font-mono text-[11px]">OP 30: 4-Axis Bore & Cavity Finish</strong>
              <span>1. Clamp billet in vise with 35 Nm torque wrench. Verify jaw datum with 0.005mm dial test indicator.</span>
            </div>
            <div className="p-2 bg-forge-alabaster border border-forge-aluminum/60">
              <strong className="text-forge-black block font-mono text-[11px]">COOLANT SPECIFICATION</strong>
              <span>Ensure high-pressure through-spindle coolant line is open (pressure &ge; 12 bar).</span>
            </div>
            <div className="p-2 bg-forge-alabaster border border-forge-aluminum/60">
              <strong className="text-forge-black block font-mono text-[11px]">QUALITY VERIFICATION</strong>
              <span>Every 50th part requires internal bore micrometer check (&plusmn;0.012mm). Stamped at QA Station.</span>
            </div>
          </div>
        </div>

        {/* Required Material & Tooling Specs */}
        <div className="lg:col-span-6 bg-white border border-forge-aluminum p-4 space-y-2.5 font-mono text-xs">
          <span className="font-bold text-forge-black uppercase text-xs block border-b border-forge-aluminum/40 pb-2 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-forge-orange" aria-hidden="true" />
            REQUIRED MATERIAL & TOOLING STAGED
          </span>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-forge-alabaster border border-forge-aluminum/70 flex items-center justify-between">
              <div>
                <span className="text-forge-steel text-[10px] block">MATERIAL GRADE</span>
                <strong className="text-forge-black text-xs">{activeJob.material}</strong>
                <span className="text-forge-steel text-[10px] block">Staged from Howrah Stores Bay A-04</span>
              </div>
              <div>
                {materialConfirmed ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-[10px]">
                    STAGED & VERIFIED
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmMaterial}
                    className="px-2.5 py-1 bg-forge-orange text-white text-[10px] font-bold uppercase hover:bg-forge-orange-hover"
                  >
                    CONFIRM STAGED
                  </button>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-forge-alabaster border border-forge-aluminum/70 flex items-center justify-between">
              <div>
                <span className="text-forge-steel text-[10px] block">ACTIVE CUTTING TOOL</span>
                <strong className="text-forge-black text-xs">Seco 12mm 4-Flute Solid Carbide</strong>
                <span className="text-forge-steel text-[10px] block">Spindle Pocket #04 • 78% life</span>
              </div>
              <button
                type="button"
                onClick={() => setActionModal('TOOL_SWAP')}
                className="px-2 py-1 bg-white border border-forge-aluminum text-forge-black text-[10px] font-semibold hover:border-forge-black"
              >
                SWAP INSERT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 12 OPERATOR ACTIONS GRID (Large 44-48px Touch Targets for Tablets/Shop Terminals) */}
      <div className="bg-white border border-forge-aluminum p-4 sm:p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-forge-aluminum/50 pb-2">
          <span className="font-bold text-xs uppercase tracking-wider text-forge-black">
            SHOP-FLOOR OPERATIONAL ACTIONS (TOUCH CONTROL)
          </span>
          <span className="text-[10px] text-forge-steel">
            TAP ACTION BUTTONS TO EXECUTE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Action 1: Start Work Order */}
          <button
            type="button"
            onClick={handleStartOrder}
            disabled={localJobState === 'IN_PROGRESS' && localMachineState === 'RUNNING'}
            className="min-h-[48px] p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>1. START JOB</span>
          </button>

          {/* Action 2: Pause Work Order */}
          <button
            type="button"
            onClick={handlePauseOrder}
            disabled={localJobState !== 'IN_PROGRESS'}
            className="min-h-[48px] p-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Pause className="w-4 h-4" aria-hidden="true" />
            <span>2. PAUSE JOB</span>
          </button>

          {/* Action 3: Resume Work Order */}
          <button
            type="button"
            onClick={handleResumeOrder}
            disabled={localJobState === 'IN_PROGRESS'}
            className="min-h-[48px] p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>3. RESUME JOB</span>
          </button>

          {/* Action 4: Record Completed (+1) */}
          <button
            type="button"
            onClick={() => handleAddCompleted(1)}
            className="min-h-[48px] p-3 bg-forge-black hover:bg-zinc-800 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Plus className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>4. RECORD +1 PC</span>
          </button>

          {/* Action 4b: Record Completed (+5) */}
          <button
            type="button"
            onClick={() => handleAddCompleted(5)}
            className="min-h-[48px] p-3 bg-forge-black hover:bg-zinc-800 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Plus className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>RECORD +5 PCS</span>
          </button>

          {/* Action 5: Record Rejected / Scrap */}
          <button
            type="button"
            onClick={() => setActionModal('DEFECT')}
            className="min-h-[48px] p-3 bg-white border-2 border-rose-600 text-rose-700 hover:bg-rose-50 font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
            <span>5. RECORD SCRAP</span>
          </button>

          {/* Action 6 & 7: Report Downtime with Reason */}
          <button
            type="button"
            onClick={() => setActionModal('DOWNTIME')}
            className="min-h-[48px] p-3 bg-amber-50 border-2 border-amber-600 text-amber-900 hover:bg-amber-100 font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Clock className="w-4 h-4 text-amber-700" aria-hidden="true" />
            <span>6. REPORT DOWNTIME</span>
          </button>

          {/* Action 8: Report Defect */}
          <button
            type="button"
            onClick={() => setActionModal('DEFECT')}
            className="min-h-[48px] p-3 bg-white border border-forge-aluminum text-forge-black hover:border-forge-black font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>8. REPORT DEFECT</span>
          </button>

          {/* Action 9: Request Maintenance */}
          <button
            type="button"
            onClick={() => setActionModal('MAINTENANCE')}
            className="min-h-[48px] p-3 bg-white border border-forge-aluminum text-forge-black hover:border-forge-black font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Wrench className="w-4 h-4 text-forge-orange" aria-hidden="true" />
            <span>9. CALL MAINTENANCE</span>
          </button>

          {/* Action 10: Confirm Material */}
          <button
            type="button"
            onClick={handleConfirmMaterial}
            className="min-h-[48px] p-3 bg-white border border-forge-aluminum text-forge-black hover:border-forge-black font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Boxes className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>10. CONFIRM MATERIAL</span>
          </button>

          {/* Action 11: Tool Replacement */}
          <button
            type="button"
            onClick={() => setActionModal('TOOL_SWAP')}
            className="min-h-[48px] p-3 bg-white border border-forge-aluminum text-forge-black hover:border-forge-black font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <RotateCcw className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>11. SWAP INSERT</span>
          </button>

          {/* Action 12: Complete Work Order */}
          <button
            type="button"
            onClick={() => setActionModal('COMPLETE')}
            className="min-h-[48px] p-3 bg-forge-orange hover:bg-forge-orange-hover text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            <span>12. COMPLETE BATCH</span>
          </button>
        </div>
      </div>

      {/* ACTION MODAL DIALOGS WITH SMOOTH FADE & SCALE */}
      <ModalMotion
        isOpen={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        className="bg-white border-2 border-forge-black w-full max-w-lg p-5 space-y-4 shadow-2xl font-mono"
      >
        <div>
          {actionModal === 'DOWNTIME' && (
              <>
                <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2">
                  <span className="font-bold text-sm uppercase text-forge-black flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    SELECT DOWNTIME REASON (SEMI E10)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-forge-steel font-sans">
                    Select root reason for stoppage on spindle {machine.id}. This updates shift loss pareto in real-time.
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { id: 'CHIP_SWARF_CLEARANCE', label: 'Chip Swarf Clearance & Bed Cleaning' },
                      { id: 'COOLANT_PRESSURE_DROP', label: 'Coolant Flow / Pressure Loss' },
                      { id: 'TOOL_WEAR_TOUCH_OFF', label: 'Tool Wear Touch-Off & Insert Index' },
                      { id: 'FIXTURE_DIAL_IN', label: 'Fixture Dial-in & Soft Jaw Adjustment' },
                      { id: 'AWAITING_QA_VERIFICATION', label: 'Awaiting CMM / First Piece Inspection' }
                    ].map((reason) => (
                      <button
                        type="button"
                        key={reason.id}
                        onClick={() => setSelectedDowntimeReason(reason.id)}
                        className={`w-full p-2.5 text-left border font-mono text-xs transition-colors ${
                          selectedDowntimeReason === reason.id
                            ? 'bg-forge-black text-white border-forge-black font-bold'
                            : 'bg-forge-alabaster border-forge-aluminum hover:border-forge-steel text-forge-black'
                        }`}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-forge-aluminum/40">
                  <MotionButton
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 bg-white border border-forge-aluminum text-xs uppercase hover:bg-forge-alabaster"
                  >
                    Cancel
                  </MotionButton>
                  <MotionButton
                    type="button"
                    onClick={handleSubmitDowntime}
                    className="px-4 py-1.5 bg-amber-600 text-white font-bold text-xs uppercase hover:bg-amber-700"
                  >
                    Confirm Stoppage
                  </MotionButton>
                </div>
              </>
            )}

            {actionModal === 'DEFECT' && (
              <>
                <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2">
                  <span className="font-bold text-sm uppercase text-forge-black flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    RECORD PART DEFECT & SCRAP
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-forge-steel font-sans">
                    Log defect type for scrap recording on {activeJob.orderNumber}.
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { id: 'DIMENSIONAL_OOT', label: 'Dimensional Out of Tolerance (Vernier Check)' },
                      { id: 'SURFACE_FINISH_ROUGH', label: 'Surface Finish Deterioration (Ra > 0.8)' },
                      { id: 'TOOL_CHATTER_MARKS', label: 'Tool Vibration / Chatter Marks' },
                      { id: 'MATERIAL_BLOWHOLE', label: 'Raw Casting Porosity / Blowhole' }
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => setDefectReason(d.id)}
                        className={`w-full p-2.5 text-left border font-mono text-xs transition-colors ${
                          defectReason === d.id
                            ? 'bg-rose-700 text-white border-rose-700 font-bold'
                            : 'bg-forge-alabaster border-forge-aluminum hover:border-forge-steel text-forge-black'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-forge-aluminum/40">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 bg-white border border-forge-aluminum text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDefect}
                    className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs uppercase hover:bg-rose-700"
                  >
                    Confirm Defect & Scrap
                  </button>
                </div>
              </>
            )}

            {actionModal === 'MAINTENANCE' && (
              <>
                <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2">
                  <span className="font-bold text-sm uppercase text-forge-black flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-forge-orange" aria-hidden="true" />
                    REQUEST URGENT MAINTENANCE TECHNICIAN
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans text-forge-steel">
                  <p>
                    Dispatch emergency ticket for spindle <strong>{machine.id}</strong> ({machine.name}).
                  </p>
                  <div className="p-3 bg-forge-alabaster border border-forge-aluminum space-y-1 font-mono text-xs text-forge-black">
                    <div>Technician on duty: <strong>Vikram Singh</strong> (Shift 01)</div>
                    <div>Location: Howrah CNC Cell Substation</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-forge-aluminum/40">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 bg-white border border-forge-aluminum text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestMaintenance}
                    className="px-4 py-1.5 bg-forge-orange text-white font-bold text-xs uppercase hover:bg-forge-orange-hover"
                  >
                    Dispatch Request
                  </button>
                </div>
              </>
            )}

            {actionModal === 'TOOL_SWAP' && (
              <>
                <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2">
                  <span className="font-bold text-sm uppercase text-forge-black flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    CONFIRM TOOL / INSERT SWAP
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans text-forge-steel">
                  <p>
                    Confirm that insert has been indexed/swapped on spindle <strong>{machine.id}</strong>.
                    This resets tool wear cycle accumulator and decrements crib backup inventory.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-forge-aluminum/40">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 bg-white border border-forge-aluminum text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmToolSwap}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700"
                  >
                    Confirm Tool Reset
                  </button>
                </div>
              </>
            )}

            {actionModal === 'COMPLETE' && (
              <>
                <div className="flex items-center justify-between border-b border-forge-aluminum/60 pb-2">
                  <span className="font-bold text-sm uppercase text-forge-black flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    COMPLETE PRODUCTION ORDER
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans text-forge-steel">
                  <p>
                    Mark order <strong>{activeJob.orderNumber}</strong> as complete?
                    Completed: <strong>{completedQty} pcs</strong> • Scrap: <strong>{scrappedQty} pcs</strong>.
                  </p>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-[11px]">
                    Batch will be transferred to CMM QA Inspection for final sign-off.
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-forge-aluminum/40">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 bg-white border border-forge-aluminum text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-700"
                  >
                    Finalize Batch
                  </button>
                </div>
              </>
            )}
          </div>
        </ModalMotion>
    </div>
  );
};
