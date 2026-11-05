import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ChamferCard } from '../ui/ChamferCard';

interface WorkOrderItem {
  orderNumber: string;
  partName: string;
  status: 'In Progress' | 'Setup' | 'Queued' | 'Completed';
  jobId?: string;
  machineId?: string;
}

interface ActiveWorkOrdersCardProps {
  orders?: WorkOrderItem[];
  onSelectJob?: (jobId: string) => void;
  onViewAll?: () => void;
}

export const ActiveWorkOrdersCard: React.FC<ActiveWorkOrdersCardProps> = ({
  orders = [
    { orderNumber: 'WO-8421', partName: 'Bracket', status: 'In Progress', jobId: 'JOB-2026-001', machineId: 'VMC-01' },
    { orderNumber: 'WO-8420', partName: 'Housing', status: 'Setup', jobId: 'JOB-2026-003', machineId: 'CNC-04' },
    { orderNumber: 'WO-8419', partName: 'Shaft', status: 'Queued', jobId: 'JOB-2026-006', machineId: 'HMC-03' }
  ],
  onSelectJob,
  onViewAll
}) => {
  const getBadgeStyle = (status: WorkOrderItem['status']) => {
    switch (status) {
      case 'In Progress':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Setup':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Queued':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Completed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-forge-alabaster text-forge-steel border-forge-aluminum';
    }
  };

  return (
    <ChamferCard
      title="Active Work Orders"
      action={
        onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="font-mono text-[10px] text-forge-steel hover:text-forge-orange flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            ALL ORDERS <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </button>
        ) : undefined
      }
    >
      <div 
        className="overflow-x-auto pt-1 pb-1"
        tabIndex={0}
        role="region"
        aria-label="Active work orders summary table"
      >
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[280px]">
          <thead>
            <tr className="border-b border-forge-aluminum/60 text-[11px] text-forge-steel">
              <th scope="col" className="pb-2 font-semibold">WO No.</th>
              <th scope="col" className="pb-2 font-semibold">Part</th>
              <th scope="col" className="pb-2 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forge-aluminum/30">
            {orders.map((order) => {
              const badgeClass = getBadgeStyle(order.status);
              return (
                <tr
                  key={order.orderNumber}
                  onClick={() => order.jobId && onSelectJob && onSelectJob(order.jobId)}
                  className={`group transition-colors ${
                    order.jobId ? 'cursor-pointer hover:bg-forge-alabaster/70' : ''
                  }`}
                  tabIndex={order.jobId ? 0 : undefined}
                  role={order.jobId ? 'button' : undefined}
                  onKeyDown={(e) => {
                    if (order.jobId && onSelectJob && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelectJob(order.jobId);
                    }
                  }}
                >
                  <td className="py-2.5 font-bold text-forge-black group-hover:text-forge-orange transition-colors">
                    {order.orderNumber}
                  </td>
                  <td className="py-2.5 text-forge-steel font-sans font-medium text-xs sm:text-sm">
                    {order.partName}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-semibold border ${badgeClass}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChamferCard>
  );
};
