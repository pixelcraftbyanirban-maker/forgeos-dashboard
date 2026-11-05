import React from 'react';
import { ChamferCard } from '../ui/ChamferCard';
import { StatusBadge } from '../ui/StatusBadge';
import { AuditRecord } from '../../types';
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

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
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
          <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>CRYPTOGRAPHIC HASH: VERIFIED</span>
        </div>
      }
    >
      <div 
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        tabIndex={0}
        role="region"
        aria-label="Verified production history table (scrollable horizontally)"
      >
        <table className="w-full text-left font-mono text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-forge-aluminum/80 text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/40">
              <th scope="col" className="p-2.5 font-semibold">Order ID</th>
              <th scope="col" className="p-2.5 font-semibold">Completed</th>
              <th scope="col" className="p-2.5 font-semibold">Spindle</th>
              <th scope="col" className="p-2.5 font-semibold">Completion (IST)</th>
              <th scope="col" className="p-2.5 font-semibold">QC Sign-off</th>
              <th scope="col" className="p-2.5 font-semibold text-right">Job Cost (INR)</th>
              <th scope="col" className="p-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forge-aluminum/40">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-forge-alabaster/60 transition-colors">
                <td className="p-2.5 font-bold text-forge-black flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-forge-steel flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span>{record.orderNumber}</span>
                    {record.customerName && (
                      <span className="block text-[9px] text-forge-steel font-normal">
                        {record.customerName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2.5 text-forge-steel">
                  <strong className="text-forge-black">{record.units}</strong> PCS
                </td>
                <td className="p-2.5 text-forge-steel">
                  <span className="px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-[10px] font-semibold text-forge-black">
                    {record.machineId}
                  </span>
                </td>
                <td className="p-2.5 text-forge-steel text-[11px]">
                  {record.completionDate}
                </td>
                <td className="p-2.5 text-forge-steel text-[11px] truncate max-w-[150px]">
                  {record.verifiedBy}
                </td>
                <td className="p-2.5 text-right font-semibold text-forge-black">
                  {formatINR(record.totalCost, true)}
                </td>
                <td className="p-2.5 text-center">
                  <StatusBadge type="production" status={record.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-2.5 border-t border-forge-aluminum/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-forge-steel">
        <span>Displaying latest certified production batches</span>
        <button
          type="button"
          onClick={() => onViewReport && onViewReport('all')}
          aria-label="View complete historical audit log in reports"
          className="text-forge-orange hover:underline font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        >
          VIEW COMPLETE AUDIT LOG <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
        </button>
      </div>
    </ChamferCard>
  );
};
