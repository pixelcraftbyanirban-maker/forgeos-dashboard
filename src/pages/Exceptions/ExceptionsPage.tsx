import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProductionException } from '../../types';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  Search, 
  Cpu, 
  FileText
} from 'lucide-react';

interface ExceptionsPageProps {
  exceptions: ProductionException[];
  onAcknowledge: (id: string) => void;
  onSelectMachine: (machineId: string) => void;
  onSelectJob: (jobId: string) => void;
}

export const ExceptionsPage: React.FC<ExceptionsPageProps> = ({
  exceptions,
  onAcknowledge,
  onSelectMachine,
  onSelectJob
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(exceptions[0]?.id || null);
  const [signOffNotes, setSignOffNotes] = useState<Record<string, string>>({});

  const filteredExceptions = exceptions.filter((ex) => {
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

    return matchesSearch && matchesSeverity;
  });

  const criticalCount = exceptions.filter((e) => e.severity === 'CRITICAL').length;
  const warningCount = exceptions.filter((e) => e.severity === 'WARNING').length;
  const unackCount = exceptions.filter((e) => !e.acknowledged).length;

  const activeSelected = exceptions.find((e) => e.id === selectedExceptionId) || filteredExceptions[0];

  const handleSignOff = (id: string) => {
    onAcknowledge(id);
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
          category="COMPLIANCE AUDIT SIGN-OFF"
          value={`${exceptions.length - unackCount} / ${exceptions.length}`}
          unit="VERIFIED"
          subtext="Shift supervisor ledger stamped"
          accentColor="emerald"
          badge="ISO 9001"
        />
      </div>

      {/* 2. Main Two-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Exceptions List */}
        <div className="lg:col-span-5 space-y-4">
          <ChamferCard
            title="DEVIATION REGISTER"
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

                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'ALL', label: `ALL (${exceptions.length})` },
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

                      <div className="flex items-center justify-between text-[9px] font-mono text-forge-steel pt-1 border-t border-forge-aluminum/40">
                        <span>{ex.timestamp}</span>
                        {ex.acknowledged ? (
                          <span className="text-emerald-800 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" aria-hidden="true" /> VERIFIED
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold animate-pulse">
                            UNACKNOWLEDGED
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ChamferCard>
        </div>

        {/* Right Column: Deep Chronological Investigation Panel */}
        <div className="lg:col-span-7 space-y-4">
          {activeSelected ? (
            <ChamferCard
              title={`INVESTIGATION • ${activeSelected.id} (${activeSelected.category})`}
              tag="DIAGNOSTIC TRACE"
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
              <div className="space-y-4 font-mono">
                {/* Exception Overview Box */}
                <div className="p-3.5 bg-forge-alabaster border border-forge-aluminum space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-display font-bold text-base text-forge-black">
                      {activeSelected.title}
                    </span>
                    <span className="text-[10px] text-forge-steel">
                      Detected: <strong>{activeSelected.timestamp}</strong>
                    </span>
                  </div>
                  <p className="font-sans text-xs text-forge-steel leading-relaxed">
                    {activeSelected.description}
                  </p>
                </div>

                {/* Supporting Chronological Sensor Timeline */}
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

                {/* Supervisor Sign-Off & Verification Box */}
                <div className="p-3.5 border border-forge-aluminum bg-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between border-b border-forge-aluminum/40 pb-2 gap-1">
                    <span className="font-bold text-xs text-forge-black uppercase">
                      SUPERVISOR SIGN-OFF & CORRECTIVE ACTION
                    </span>
                    <span className="text-[10px] text-forge-steel">
                      STATUS: {activeSelected.acknowledged ? 'VERIFIED' : 'PENDING REVIEW'}
                    </span>
                  </div>

                  {activeSelected.acknowledged ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" aria-hidden="true" />
                        <span>VERIFIED & ACKNOWLEDGED BY: {activeSelected.acknowledgedBy || 'Arindam Chatterjee (Production Manager)'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-900 font-sans">
                        Audit trail stamped for Howrah plant. Telemetry logged into Indian manufacturing compliance ledger.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor={`supervisor-notes-${activeSelected.id}`} className="sr-only">
                        Supervisor corrective action notes
                      </label>
                      <textarea
                        id={`supervisor-notes-${activeSelected.id}`}
                        rows={2}
                        placeholder="Enter supervisor corrective notes (e.g. Swarf cleared from coolant reservoir, dial indicator trueing completed by Sourav Das)..."
                        value={signOffNotes[activeSelected.id] || ''}
                        onChange={(e) => setSignOffNotes({ ...signOffNotes, [activeSelected.id]: e.target.value })}
                        className="w-full p-2 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange focus:bg-white"
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSignOff(activeSelected.id)}
                          aria-label={`Sign off deviation for ${activeSelected.machineId}`}
                          className="px-4 py-2 bg-forge-orange hover:bg-forge-orange-hover text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>SIGN OFF DEVIATION</span>
                        </button>
                      </div>
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
