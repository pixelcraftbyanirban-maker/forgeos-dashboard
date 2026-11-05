import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProductionException } from '../../types';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  Clock, 
  Search, 
  Wrench, 
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

  return (
    <div className="space-y-6">
      {/* 1. Exceptions KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="UNACKNOWLEDGED DEVIATIONS"
          value={unackCount}
          unit="EVENTS"
          subtext="Requires immediate supervisor review"
          accentColor={unackCount > 0 ? 'orange' : 'emerald'}
          badge="PRIORITY"
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
          category="MTBF / INCIDENT RATE"
          value="18.4h"
          subtext="Mean time between shop interruptions"
          trend={{ value: "+2.1h vs Last Week", isPositive: true }}
          accentColor="emerald"
          badge="RELIABILITY"
        />
      </div>

      {/* 2. Exceptions Management Card */}
      <ChamferCard
        title="PRODUCTION EXCEPTIONS & SHOP DEVIATION LOG"
        tag="LIVE INCIDENTS"
        action={
          <div className="font-mono text-[10px] text-forge-steel">
            ACTIVE AUDIT TRAIL LOGGING
          </div>
        }
      >
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-forge-aluminum/60 pb-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deviations, alarms, machine IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/60 focus:outline-none focus:border-forge-orange"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'ALL', label: `ALL (${exceptions.length})` },
                { id: 'UNACKNOWLEDGED', label: `UNACKNOWLEDGED (${unackCount})` },
                { id: 'CRITICAL', label: `CRITICAL (${criticalCount})` },
                { id: 'WARNING', label: `WARNINGS (${warningCount})` },
                { id: 'INFO', label: 'INFO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSeverityFilter(tab.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors border ${
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

          {/* Exceptions List */}
          <div className="space-y-3">
            {filteredExceptions.map((ex) => {
              const isCritical = ex.severity === 'CRITICAL';
              const isWarning = ex.severity === 'WARNING';

              const icon = isCritical ? (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              );

              const borderClass = isCritical
                ? 'border-rose-400 bg-rose-50/20'
                : isWarning
                ? 'border-amber-400 bg-amber-50/20'
                : 'border-forge-aluminum bg-white';

              return (
                <div
                  key={ex.id}
                  className={`p-4 border relative flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all ${borderClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{icon}</div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-forge-black">
                          {ex.title}
                        </span>
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.2 font-bold uppercase border ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {ex.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-forge-steel font-sans max-w-2xl">
                        {ex.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-mono text-forge-steel">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          DETECTED: {ex.timestamp}
                        </span>

                        <button
                          onClick={() => onSelectMachine(ex.machineId)}
                          className="hover:underline text-forge-black font-semibold flex items-center gap-1"
                        >
                          <Cpu className="w-3 h-3 text-forge-steel" />
                          MACHINE: {ex.machineId}
                        </button>

                        {ex.jobId && (
                          <button
                            onClick={() => onSelectJob(ex.jobId!)}
                            className="hover:underline text-forge-orange font-semibold flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-forge-steel" />
                            JOB: {ex.jobId}
                          </button>
                        )}

                        {ex.acknowledged ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 border border-emerald-300">
                            ✓ ACKNOWLEDGED BY {ex.acknowledgedBy}
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.2 border border-rose-300 animate-pulse">
                            PENDING SUPERVISOR ACTION
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start">
                    {!ex.acknowledged ? (
                      <button
                        onClick={() => onAcknowledge(ex.id)}
                        className="px-3 py-1.5 bg-forge-black hover:bg-zinc-800 text-white font-mono text-xs font-semibold uppercase flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-forge-orange" />
                        ACKNOWLEDGE & LOG
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Opening maintenance ticket for ${ex.machineId}`)}
                        className="px-3 py-1.5 bg-forge-alabaster hover:bg-white border border-forge-aluminum font-mono text-xs font-semibold text-forge-black flex items-center gap-1.5 transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5 text-forge-steel" />
                        CREATE TICKET
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredExceptions.length === 0 && (
              <div className="py-12 text-center font-mono text-xs text-forge-steel">
                No exceptions found matching current filter criteria.
              </div>
            )}
          </div>
        </div>
      </ChamferCard>
    </div>
  );
};
