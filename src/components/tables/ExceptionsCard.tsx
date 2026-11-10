import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { ProductionException } from '../../types';
import { AlertCircle, AlertTriangle, Info, Check, Clock } from 'lucide-react';
import { MotionButton } from '../../motion';

interface ExceptionsCardProps {
  exceptions: ProductionException[];
  onAcknowledge: (id: string) => void;
  onNavigateToExceptions: () => void;
}

export const ExceptionsCard: React.FC<ExceptionsCardProps> = ({
  exceptions,
  onAcknowledge,
  onNavigateToExceptions
}) => {
  return (
    <ChamferCard
      title="ACTIVE PRODUCTION EXCEPTIONS"
      tag="DEVIATION ALERTS"
      action={
        <button
          type="button"
          onClick={onNavigateToExceptions}
          aria-label={`View all ${exceptions.length} production exceptions`}
          className="font-mono text-[10px] text-forge-orange hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        >
          VIEW ALL ({exceptions.length})
        </button>
      }
    >
      <div className="space-y-2.5">
        {exceptions.map((ex) => {
          const isCritical = ex.severity === 'CRITICAL';
          const isWarning = ex.severity === 'WARNING';

          const icon = isCritical ? (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
          );

          const borderBg = isCritical
            ? 'border-rose-300 bg-rose-50/40'
            : isWarning
            ? 'border-amber-300 bg-amber-50/30'
            : 'border-forge-aluminum bg-forge-alabaster/40';

          return (
            <div
              key={ex.id}
              className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${borderBg}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{icon}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-forge-black">
                      {ex.title}
                    </span>
                    <span className="font-mono text-[9px] px-1 py-0.2 bg-white border border-forge-aluminum text-forge-steel font-semibold">
                      {ex.machineId}
                    </span>
                  </div>
                  <p className="text-xs text-forge-steel font-sans mt-0.5">
                    {ex.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-forge-steel">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {ex.timestamp}
                    </span>
                    {ex.jobId && <span>• JOB: {ex.jobId}</span>}
                    {ex.acknowledged && (
                      <span className="text-emerald-800 font-semibold">
                        • ACKNOWLEDGED BY {ex.acknowledgedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {!ex.acknowledged ? (
                  <MotionButton
                    type="button"
                    onClick={() => onAcknowledge(ex.id)}
                    aria-label={`Acknowledge exception on ${ex.machineId}: ${ex.title}`}
                    className="px-2.5 py-1 bg-white hover:bg-forge-alabaster border border-forge-aluminum text-xs font-mono font-semibold text-forge-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
                  >
                    <Check className="w-3 h-3 text-forge-orange" aria-hidden="true" />
                    ACKNOWLEDGE
                  </MotionButton>
                ) : (
                  <span className="text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 animate-in fade-in duration-200">
                    <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" /> VERIFIED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ChamferCard>
  );
};
