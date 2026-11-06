import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProductionException, DeviationStatus, AssigneeRole, CorrectiveActionRecord } from '../../types';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  Search, 
  Cpu, 
  FileText,
  UserCheck,
  ShieldAlert,
  Send,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

interface ExceptionsPageProps {
  exceptions: ProductionException[];
  onAcknowledge: (id: string) => void;
  onSelectMachine: (machineId: string) => void;
  onSelectJob: (jobId: string) => void;
}

const LIFECYCLE_STAGES: { id: DeviationStatus; label: string }[] = [
  { id: 'DETECTED', label: '1. Detected' },
  { id: 'ACKNOWLEDGED', label: '2. Acknowledged' },
  { id: 'INVESTIGATING', label: '3. Investigating' },
  { id: 'CORRECTIVE_ACTION', label: '4. Action' },
  { id: 'VERIFIED', label: '5. Verified' },
  { id: 'CLOSED', label: '6. Closed' }
];

const STAGE_ORDER: Record<DeviationStatus, number> = {
  DETECTED: 1,
  ACKNOWLEDGED: 2,
  INVESTIGATING: 3,
  CORRECTIVE_ACTION: 4,
  VERIFIED: 5,
  CLOSED: 6
};

export const ExceptionsPage: React.FC<ExceptionsPageProps> = ({
  exceptions: initialExceptions,
  onAcknowledge,
  onSelectMachine,
  onSelectJob
}) => {
  const [exceptionsList, setExceptionsList] = useState<ProductionException[]>(initialExceptions);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(initialExceptions[0]?.id || null);
  const [signOffNotes, setSignOffNotes] = useState<Record<string, string>>({});
  const [newInternalNote, setNewInternalNote] = useState<string>('');

  // Corrective action form states for active exception
  const [caForm, setCaForm] = useState<Partial<CorrectiveActionRecord>>({});
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const filteredExceptions = exceptionsList.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      ex.machineId.toLowerCase().includes(search.toLowerCase()) ||
      (ex.jobId && ex.jobId.toLowerCase().includes(search.toLowerCase()));

    const matchesSeverity =
      severityFilter === 'ALL'
        ? true
        : severityFilter === 'UNACKNOWLEDGED'
        ? !ex.acknowledged
        : ex.severity === severityFilter;

    const matchesStatus = statusFilter === 'ALL' || ex.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalCount = exceptionsList.filter((e) => e.severity === 'CRITICAL').length;
  const warningCount = exceptionsList.filter((e) => e.severity === 'WARNING').length;
  const unackCount = exceptionsList.filter((e) => !e.acknowledged).length;
  const closedCount = exceptionsList.filter((e) => e.status === 'CLOSED' || e.status === 'VERIFIED').length;

  const activeSelected = exceptionsList.find((e) => e.id === selectedExceptionId) || filteredExceptions[0];

  // Advance lifecycle stage handler
  const handleStageChange = (newStatus: DeviationStatus) => {
    if (!activeSelected) return;
    setExceptionsList((prev) =>
      prev.map((e) => {
        if (e.id === activeSelected.id) {
          const isAck = newStatus !== 'DETECTED';
          return {
            ...e,
            status: newStatus,
            acknowledged: isAck,
            acknowledgedBy: isAck ? (e.acknowledgedBy || 'Arindam Chatterjee (Prod. Mgr)') : undefined
          };
        }
        return e;
      })
    );
    if (newStatus !== 'DETECTED' && !activeSelected.acknowledged) {
      onAcknowledge(activeSelected.id);
    }
  };

  // Change Assignee
  const handleAssigneeChange = (person: string, role: AssigneeRole) => {
    if (!activeSelected) return;
    setExceptionsList((prev) =>
      prev.map((e) =>
        e.id === activeSelected.id
          ? { ...e, assignee: person, assigneeRole: role }
          : e
      )
    );
  };

  // Toggle Escalation
  const handleToggleEscalation = () => {
    if (!activeSelected) return;
    setExceptionsList((prev) =>
      prev.map((e) =>
        e.id === activeSelected.id
          ? { ...e, escalated: !e.escalated }
          : e
      )
    );
  };

  // Add Internal Note
  const handleAddNote = () => {
    if (!activeSelected || !newInternalNote.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;
    const noteEntry = `[${timeStr}] Arindam Chatterjee: ${newInternalNote.trim()}`;

    setExceptionsList((prev) =>
      prev.map((e) =>
        e.id === activeSelected.id
          ? { ...e, internalNotes: [...(e.internalNotes || []), noteEntry] }
          : e
      )
    );
    setNewInternalNote('');
  };

  // Save Corrective Action Form
  const handleSaveCorrectiveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelected) return;

    const updatedCA: CorrectiveActionRecord = {
      category: caForm.category || activeSelected.category,
      problemDescription: caForm.problemDescription || activeSelected.correctiveAction?.problemDescription || activeSelected.description,
      rootCause: caForm.rootCause || activeSelected.correctiveAction?.rootCause || 'Root cause investigation in progress',
      correctiveAction: caForm.correctiveAction || activeSelected.correctiveAction?.correctiveAction || signOffNotes[activeSelected.id] || 'Tool offset touch-off and cleaning completed',
      responsiblePerson: caForm.responsiblePerson || activeSelected.assignee || 'Vikram Singh (Maintenance Tech)',
      verificationNotes: caForm.verificationNotes || activeSelected.correctiveAction?.verificationNotes || 'Post-repair runout and sensor verify within specification',
      approvalStatus: caForm.approvalStatus || 'APPROVED',
      resolutionTimestamp: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} IST`
    };

    setExceptionsList((prev) =>
      prev.map((item) =>
        item.id === activeSelected.id
          ? {
              ...item,
              correctiveAction: updatedCA,
              status: 'VERIFIED',
              acknowledged: true,
              acknowledgedBy: 'Arindam Chatterjee (Prod. Mgr)',
              resolvedAt: updatedCA.resolutionTimestamp
            }
          : item
      )
    );

    onAcknowledge(activeSelected.id);
    setFormFeedback('Corrective action recorded and verified.');
    setTimeout(() => setFormFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Exceptions KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="UNACKNOWLEDGED DEVIATIONS"
          value={unackCount}
          unit="EVENTS"
          subtext="Requires immediate supervisor sign-off"
          accentColor={unackCount > 0 ? 'orange' : 'emerald'}
          badge="ACTION REQUIRED"
        />

        <MetricCard
          category="CRITICAL MACHINE ALARMS"
          value={criticalCount}
          subtext="Spindle halted (Emergency Stop/Thermal)"
          trend={{ value: "1 Halted", isPositive: false }}
          accentColor="orange"
          badge="SPINDLE HALT"
        />

        <MetricCard
          category="SETUP & TIMING DELAYS"
          value={warningCount}
          subtext="Cycle time / fixture deviations"
          accentColor="black"
          badge="WARNINGS"
        />

        <MetricCard
          category="CLOSED & VERIFIED"
          value={`${closedCount} / ${exceptionsList.length}`}
          unit="VERIFIED"
          subtext="Quality audit trail confirmed"
          accentColor="emerald"
          badge="INTERNAL QA AUDIT"
        />
      </div>

      {/* 2. Main Two-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Exceptions List */}
        <div className="lg:col-span-5 space-y-4">
          <ChamferCard
            title="DEVIATION REGISTER & WORKFLOW"
            tag={`${filteredExceptions.length} EVENTS`}
            action={
              <span className="font-mono text-[10px] text-forge-steel font-semibold">
                AUDIT LOG
              </span>
            }
          >
            <div className="space-y-3">
              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Search deviation register by title, machine, or work order"
                    placeholder="Search exceptions, machines, work orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/70 focus:outline-none focus:border-forge-orange focus:bg-white"
                  />
                </div>

                {/* Severity filters */}
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'ALL', label: `ALL (${exceptionsList.length})` },
                    { id: 'UNACKNOWLEDGED', label: `UNACK (${unackCount})` },
                    { id: 'CRITICAL', label: `CRIT (${criticalCount})` },
                    { id: 'WARNING', label: `WARN (${warningCount})` }
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setSeverityFilter(tab.id)}
                      aria-pressed={severityFilter === tab.id}
                      className={`px-2 py-1 text-[9px] font-mono tracking-wider transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                        severityFilter === tab.id
                          ? 'bg-forge-black text-white border-forge-black font-semibold'
                          : 'bg-white text-forge-steel border-forge-aluminum hover:text-forge-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status lifecycle filter */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-forge-steel">
                  <span>STAGE:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter deviations by lifecycle status"
                    className="bg-white border border-forge-aluminum px-1.5 py-0.5 text-[10px] font-mono text-forge-black focus:outline-none focus:border-forge-orange flex-1"
                  >
                    <option value="ALL">All Lifecycle Stages</option>
                    <option value="DETECTED">1. Detected</option>
                    <option value="ACKNOWLEDGED">2. Acknowledged</option>
                    <option value="INVESTIGATING">3. Investigating</option>
                    <option value="CORRECTIVE_ACTION">4. Corrective Action</option>
                    <option value="VERIFIED">5. Verified</option>
                    <option value="CLOSED">6. Closed</option>
                  </select>
                </div>
              </div>

              {/* Exception Items List */}
              <div 
                className="space-y-2 max-h-[580px] overflow-y-auto pr-1"
                role="region"
                aria-label="Deviation items list"
              >
                {filteredExceptions.map((ex) => {
                  const isSelected = activeSelected?.id === ex.id;
                  const isCritical = ex.severity === 'CRITICAL';
                  const isWarning = ex.severity === 'WARNING';

                  return (
                    <button
                      type="button"
                      key={ex.id}
                      onClick={() => setSelectedExceptionId(ex.id)}
                      aria-pressed={isSelected}
                      aria-label={`Exception ${ex.id} on ${ex.machineId}: ${ex.title}, severity ${ex.severity}`}
                      className={`w-full text-left p-3 border transition-all cursor-pointer relative space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                        isSelected
                          ? 'border-forge-black bg-forge-alabaster shadow-flat ring-1 ring-forge-black'
                          : isCritical
                          ? 'border-rose-300 bg-rose-50/30 hover:border-rose-500'
                          : isWarning
                          ? 'border-amber-300 bg-amber-50/30 hover:border-amber-500'
                          : 'border-forge-aluminum bg-white hover:border-forge-steel'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-forge-black flex items-center gap-1.5">
                          {isCritical ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" aria-hidden="true" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                          )}
                          <span>{ex.machineId}</span>
                          {ex.jobId && <span className="text-forge-steel">• {ex.jobId}</span>}
                        </span>

                        <span
                          className={`px-1.5 py-0.2 border uppercase text-[8px] font-bold ${
                            isCritical
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {ex.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="font-display font-semibold text-xs text-forge-black line-clamp-1">
                        {ex.title}
                      </div>

                      {/* Lifecycle status & Escalation badge */}
                      <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-forge-aluminum/40">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 bg-forge-alabaster border border-forge-aluminum text-forge-black font-semibold uppercase text-[8px]">
                            {ex.status}
                          </span>
                          {ex.escalated && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white font-bold text-[8px]">
                              ESCALATED
                            </span>
                          )}
                        </div>
                        <span className="text-forge-steel">{ex.timestamp}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ChamferCard>
        </div>

        {/* Right Column: Deep Investigation & Corrective Action Workflow */}
        <div className="lg:col-span-7 space-y-4">
          {activeSelected ? (
            <ChamferCard
              title={`DEVIATION ${activeSelected.id} • ${activeSelected.category}`}
              tag="WORKFLOW MANAGEMENT"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMachine(activeSelected.machineId)}
                    aria-label={`Inspect spindle ${activeSelected.machineId}`}
                    className="px-2 py-1 bg-white border border-forge-aluminum text-[10px] font-mono text-forge-black hover:border-forge-black font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
                  >
                    <Cpu className="w-3 h-3 text-forge-orange flex-shrink-0" aria-hidden="true" />
                    <span>INSPECT {activeSelected.machineId}</span>
                  </button>

                  {activeSelected.jobId && (
                    <button
                      type="button"
                      onClick={() => onSelectJob(activeSelected.jobId!)}
                      aria-label={`Inspect order ${activeSelected.jobId}`}
                      className="px-2 py-1 bg-white border border-forge-aluminum text-[10px] font-mono text-forge-black hover:border-forge-black font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
                    >
                      <FileText className="w-3 h-3 text-forge-orange flex-shrink-0" aria-hidden="true" />
                      <span>INSPECT {activeSelected.jobId}</span>
                    </button>
                  )}
                </div>
              }
            >
              <div className="space-y-4 font-mono text-xs">
                {/* 1. 6-STAGE DEVIATION LIFECYCLE STEPPER (Phase 6) */}
                <div className="p-3 bg-forge-alabaster border border-forge-aluminum space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-forge-black uppercase flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-forge-steel" aria-hidden="true" />
                      DEVIATION LIFECYCLE STEPPER (6 STAGES)
                    </span>
                    <span className="font-bold text-forge-orange">
                      ACTIVE: {activeSelected.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 text-[9px]">
                    {LIFECYCLE_STAGES.map((st) => {
                      const currentOrder = STAGE_ORDER[activeSelected.status];
                      const targetOrder = STAGE_ORDER[st.id];
                      const isPast = targetOrder < currentOrder;
                      const isCurrent = targetOrder === currentOrder;

                      return (
                        <button
                          type="button"
                          key={st.id}
                          onClick={() => handleStageChange(st.id)}
                          className={`p-1.5 border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                            isCurrent
                              ? 'bg-forge-black text-white border-forge-black font-bold ring-1 ring-forge-black'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                              : 'bg-white text-forge-steel border-forge-aluminum hover:border-forge-steel'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isPast && <Check className="w-2.5 h-2.5 text-emerald-600" aria-hidden="true" />}
                            <span className="truncate">{st.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ASSIGNMENT & ESCALATION BAR (Phase 6) */}
                <div className="p-3 bg-white border border-forge-aluminum space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forge-aluminum/40 pb-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-forge-steel" aria-hidden="true" />
                      <span className="font-bold text-forge-black uppercase">RESPONSIBLE PERSON</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-forge-steel">DEADLINE:</span>
                      <strong className="text-forge-black">{activeSelected.resolutionDeadline || 'Shift Handover (14:00 IST)'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-forge-steel text-[10px] block">CURRENT ASSIGNEE</span>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label="Assign deviation to personnel"
                          value={activeSelected.assignee || 'Vikram Singh'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const role: AssigneeRole =
                              val.includes('Singh') ? 'MAINTENANCE_TECH' :
                              val.includes('Sharma') ? 'QUALITY_MANAGER' :
                              val.includes('Das') ? 'SUPERVISOR' : 'OPERATOR';
                            handleAssigneeChange(val, role);
                          }}
                          className="bg-forge-alabaster border border-forge-aluminum px-2 py-1 text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange w-full"
                        >
                          <option value="Vikram Singh">Vikram Singh (Maintenance Tech)</option>
                          <option value="Sourav Das">Sourav Das (Floor Supervisor)</option>
                          <option value="Priya Sharma">Priya Sharma (Quality Lead)</option>
                          <option value="Arindam Chatterjee">Arindam Chatterjee (Prod. Mgr)</option>
                          <option value="Dipak Dutta">Dipak Dutta (Operator)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleEscalation}
                          aria-pressed={activeSelected.escalated}
                          className={`flex-1 py-1.5 px-2.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                            activeSelected.escalated
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                              : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{activeSelected.escalated ? 'ESCALATED TO GM' : 'ESCALATE DEVIATION'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. STRUCTURED CORRECTIVE ACTION FORM (Phase 6) */}
                <div className="p-3.5 border border-forge-aluminum bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-forge-aluminum/40 pb-2">
                    <span className="font-bold text-xs text-forge-black uppercase">
                      STRUCTURED CORRECTIVE ACTION RECORD (CAPA)
                    </span>
                    <span className="text-[10px] text-forge-steel">
                      APPROVAL: {activeSelected.correctiveAction?.approvalStatus || 'PENDING'}
                    </span>
                  </div>

                  {formFeedback && (
                    <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>{formFeedback}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCorrectiveAction} className="space-y-3 text-[11px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                          1. Category *
                        </label>
                        <select
                          aria-label="Deviation category selection"
                          value={caForm.category || activeSelected.category}
                          onChange={(e) => setCaForm({ ...caForm, category: e.target.value })}
                          className="w-full p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black"
                        >
                          <option value="MACHINE_ALARM">Machine Alarm & Safety</option>
                          <option value="CYCLE_TIME_DEVIATION">Cycle Time Deviation</option>
                          <option value="TOOL_WEAR">Tool Wear & Insert Defect</option>
                          <option value="SETUP_DELAY">Setup & Fixture Delay</option>
                          <option value="MATERIAL_STAGED">Material Shortage / Staging</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                          2. Responsible Person *
                        </label>
                        <input
                          type="text"
                          aria-label="Responsible person"
                          value={caForm.responsiblePerson !== undefined ? caForm.responsiblePerson : (activeSelected.assignee || 'Vikram Singh')}
                          onChange={(e) => setCaForm({ ...caForm, responsiblePerson: e.target.value })}
                          className="w-full p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                        3. Problem Description *
                      </label>
                      <input
                        type="text"
                        aria-label="Problem description"
                        value={caForm.problemDescription !== undefined ? caForm.problemDescription : (activeSelected.correctiveAction?.problemDescription || activeSelected.title)}
                        onChange={(e) => setCaForm({ ...caForm, problemDescription: e.target.value })}
                        className="w-full p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black"
                      />
                    </div>

                    <div>
                      <label className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                        4. Root Cause Analysis *
                      </label>
                      <input
                        type="text"
                        aria-label="Root cause analysis"
                        placeholder="e.g. Swarf buildup inside intake strainer causing cavitation"
                        value={caForm.rootCause !== undefined ? caForm.rootCause : (activeSelected.correctiveAction?.rootCause || '')}
                        onChange={(e) => setCaForm({ ...caForm, rootCause: e.target.value })}
                        className="w-full p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black"
                      />
                    </div>

                    <div>
                      <label htmlFor={`supervisor-notes-${activeSelected.id}`} className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                        5. Corrective Action & Containment *
                      </label>
                      <textarea
                        id={`supervisor-notes-${activeSelected.id}`}
                        rows={2}
                        placeholder="Enter supervisor corrective notes (e.g. Swarf cleared from coolant reservoir, dial indicator trueing completed by Sourav Das)..."
                        value={signOffNotes[activeSelected.id] !== undefined ? signOffNotes[activeSelected.id] : (activeSelected.correctiveAction?.correctiveAction || '')}
                        onChange={(e) => {
                          setSignOffNotes({ ...signOffNotes, [activeSelected.id]: e.target.value });
                          setCaForm({ ...caForm, correctiveAction: e.target.value });
                        }}
                        className="w-full p-2 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-forge-steel text-[10px] uppercase font-semibold mb-1">
                          6. Verification Notes
                        </label>
                        <input
                          type="text"
                          aria-label="Verification notes"
                          placeholder="e.g. CMM post-check passed with 0.005mm runout"
                          value={caForm.verificationNotes !== undefined ? caForm.verificationNotes : (activeSelected.correctiveAction?.verificationNotes || '')}
                          onChange={(e) => setCaForm({ ...caForm, verificationNotes: e.target.value })}
                          className="w-full p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black"
                        />
                      </div>

                      <div className="flex items-end justify-end gap-2 pt-2 sm:pt-0">
                        <button
                          type="submit"
                          aria-label={`Sign off deviation for ${activeSelected.machineId}`}
                          className="px-4 py-2 bg-forge-orange hover:bg-forge-orange-hover text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>SIGN OFF DEVIATION</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* 4. INTERNAL COLLABORATION NOTES */}
                <div className="p-3 bg-white border border-forge-aluminum space-y-2.5">
                  <span className="font-bold text-xs text-forge-black uppercase block border-b border-forge-aluminum/40 pb-1.5">
                    INTERNAL AUDIT NOTES & REMARKS
                  </span>

                  {activeSelected.internalNotes && activeSelected.internalNotes.length > 0 ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {activeSelected.internalNotes.map((note, idx) => (
                        <div key={idx} className="p-2 bg-forge-alabaster border border-forge-aluminum/60 text-[11px] font-sans text-forge-black">
                          {note}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-forge-steel">No internal remarks appended yet.</div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add supervisor note..."
                      value={newInternalNote}
                      onChange={(e) => setNewInternalNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                      className="flex-1 p-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className="px-3 py-1.5 bg-forge-black text-white text-xs font-semibold uppercase hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" aria-hidden="true" />
                      <span>NOTE</span>
                    </button>
                  </div>
                </div>

                {/* 5. Supporting Chronological Sensor Timeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forge-black uppercase tracking-wider block">
                    CHRONOLOGICAL SENSOR EVENT LOG
                  </span>

                  {activeSelected.events && activeSelected.events.length > 0 ? (
                    <div 
                      className="border border-forge-aluminum divide-y divide-forge-aluminum/50 bg-white"
                      role="feed"
                      aria-label="Chronological sensor event entries"
                    >
                      {activeSelected.events.map((ev, i) => (
                        <div key={i} className="p-3 flex items-start gap-3 text-xs">
                          <div className="w-16 font-bold text-forge-black text-[11px] pt-0.5 flex-shrink-0">
                            {ev.time}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-semibold text-forge-black">
                                {ev.source}
                              </span>
                              {ev.channel && (
                                <span className="text-[9px] px-1 bg-forge-alabaster border border-forge-aluminum text-forge-steel">
                                  {ev.channel}
                                </span>
                              )}
                            </div>
                            <div className="text-forge-steel text-[11px] font-sans">
                              {ev.message}
                            </div>
                            {ev.sensorValue && (
                              <div className="text-[10px] text-amber-950 font-bold bg-amber-50 inline-block px-1 border border-amber-300">
                                SENSOR READING: {ev.sensorValue}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-forge-alabaster border border-forge-aluminum text-xs text-forge-steel">
                      No high-frequency sub-events logged for this category.
                    </div>
                  )}
                </div>
              </div>
            </ChamferCard>
          ) : (
            <div className="p-8 border border-forge-aluminum bg-white text-center font-mono text-xs text-forge-steel">
              Select an exception from the register to inspect its chronological event trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
