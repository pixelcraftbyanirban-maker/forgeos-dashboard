import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { AuditRecord } from '../../types';
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react';

interface AuditHistoryCardProps {
  history: AuditRecord[];
  onViewReport?: (recordId: string) => void;
}

export const AuditHistoryCard: React.FC<AuditHistoryCardProps> = ({
  history,
  onViewReport
}) => {
  return (
    <ChamferCard
      title="VERIFIED PRODUCTION HISTORY"
      tag="IMMUTABLE AUDIT TRAIL"
      action={
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>CRYPTOGRAPHIC HASH: VERIFIED</span>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-forge-aluminum/80 text-[10px] text-forge-steel uppercase tracking-wider">
              <th className="pb-2 font-semibold">Order ID</th>
              <th className="pb-2 font-semibold">Completed Units</th>
              <th className="pb-2 font-semibold">Spindle</th>
              <th className="pb-2 font-semibold">Completion Date</th>
              <th className="pb-2 font-semibold">QC Sign-off</th>
              <th className="pb-2 font-semibold text-right">Job Cost</th>
              <th className="pb-2 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forge-aluminum/40">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-forge-alabaster/60 transition-colors">
                <td className="py-2.5 font-bold text-forge-black flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-forge-steel" />
                  {record.orderNumber}
                </td>
                <td className="py-2.5 text-forge-steel">
                  <strong className="text-forge-black">{record.units}</strong> UNITS
                </td>
                <td className="py-2.5 text-forge-steel">
                  <span className="px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-[10px]">
                    {record.machineId}
                  </span>
                </td>
                <td className="py-2.5 text-forge-steel text-[11px]">
                  {record.completionDate}
                </td>
                <td className="py-2.5 text-forge-steel text-[11px] truncate max-w-[150px]">
                  {record.verifiedBy}
                </td>
                <td className="py-2.5 text-right font-semibold text-forge-black">
                  ${record.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 text-center">
                  <StatusBadge type="production" status={record.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-2.5 border-t border-forge-aluminum/40 flex items-center justify-between text-[10px] font-mono text-forge-steel">
        <span>Displaying latest certified production batches</span>
        <button
          onClick={() => onViewReport && onViewReport('all')}
          className="text-forge-orange hover:underline font-semibold flex items-center gap-1"
        >
          VIEW COMPLETE AUDIT LOG <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </ChamferCard>
  );
};
