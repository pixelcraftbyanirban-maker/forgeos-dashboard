import React from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { OeeComponentBreakdown } from '../../components/ui/OeeComponentBreakdown';
import { AuditRecord } from '../../types';
import { Download, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

interface ReportsPageProps {
  auditHistory: AuditRecord[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ auditHistory }) => {
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Units Completed', 'Machine ID', 'Completion Date', 'QC Sign-off', 'Total Cost ($)'];
    const rows = auditHistory.map(r => [
      r.orderNumber,
      r.units,
      r.machineId,
      r.completionDate,
      `"${r.verifiedBy}"`,
      r.totalCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FORGEOS_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const factoryOee = {
    overall: 87.4,
    availability: 91.2,
    performance: 96.8,
    quality: 99.1
  };

  const downtimeLossCategories = [
    { label: "SETUP & FIXTURE DIAL-IN", minutes: 185, pct: 41, color: "bg-blue-600" },
    { label: "THERMAL ALARMS & SHUTDOWN", minutes: 120, pct: 27, color: "bg-rose-600" },
    { label: "TOOL WEAR TOUCH-OFF", minutes: 80, pct: 18, color: "bg-amber-500" },
    { label: "CHIP VACUUM & CLEANING", minutes: 65, pct: 14, color: "bg-slate-500" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Reports KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="AUDITED BATCHES"
          value={auditHistory.length}
          unit="ORDERS"
          subtext="100% CMM verified batches"
          accentColor="emerald"
          badge="AUDITED"
        />

        <MetricCard
          category="CUMULATIVE BATCH VALUE"
          value="$4,105.50"
          subtext="Certified shipped parts"
          accentColor="orange"
          badge="COST CONTROL"
        />

        <MetricCard
          category="TOLERANCE ADHERENCE"
          value="99.8%"
          subtext="Class 1 aerospace & medical specs"
          trend={{ value: "Zero Returns", isPositive: true }}
          accentColor="emerald"
          badge="ISO 9001"
        />

        <MetricCard
          category="COMPLIANCE RECORD"
          value="IMMUTABLE"
          subtext="Cryptographic chain of custody"
          accentColor="black"
          badge="AUDIT READY"
        />
      </div>

      {/* 2. Graphical Performance Analytics Row (Section 09 & 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Factory OEE Breakdown */}
        <div className="lg:col-span-7">
          <OeeComponentBreakdown
            oee={factoryOee}
            title="FACTORY-WIDE GROUNDED OEE (SHIFT 01)"
            showFormula={true}
          />
        </div>

        {/* Downtime Pareto Loss Classification */}
        <div className="lg:col-span-5">
          <ChamferCard
            title="DOWNTIME PARETO CLASSIFICATION"
            tag="LOSS CATEGORIES"
            action={
              <span className="font-mono text-[10px] text-forge-steel font-semibold">
                SHIFT 01: 450 MIN TOTAL
              </span>
            }
          >
            <div className="space-y-3 font-mono text-xs">
              <p className="font-sans text-xs text-forge-steel">
                Root operational loss breakdown categorized according to SEMI E10 equipment reliability standards.
              </p>

              <div className="space-y-3 pt-2">
                {downtimeLossCategories.map((cat) => (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-forge-black">{cat.label}</span>
                      <span className="text-forge-steel font-bold">{cat.minutes}m ({cat.pct}%)</span>
                    </div>
                    <div className="h-3 bg-forge-alabaster border border-forge-aluminum overflow-hidden flex items-center">
                      <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-forge-aluminum/40 text-[10px] text-forge-steel flex justify-between">
                <span>BENCHMARK TARGET: &lt; 380 MIN</span>
                <span className="font-bold text-amber-700">+70 MIN VARIANCE</span>
              </div>
            </div>
          </ChamferCard>
        </div>
      </div>

      {/* 3. Audit Trail Table */}
      <ChamferCard
        title="HISTORICAL PRODUCTION AUDIT TRAIL & COMPLIANCE RECORDS"
        tag="REPORTS"
        action={
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-forge-black text-white hover:bg-zinc-800 text-xs font-mono font-semibold uppercase flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-forge-orange" />
            EXPORT AUDIT CSV
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All manufacturing records are timestamped with operator credentials, spindle ID, and CMM dimensional inspection logs.</span>
            </div>
            <span className="font-bold flex-shrink-0">REV 1.0 COMPLIANT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-forge-aluminum text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/50">
                  <th className="py-2.5 px-3 font-semibold">Work Order</th>
                  <th className="py-2.5 px-3 font-semibold">Completed Units</th>
                  <th className="py-2.5 px-3 font-semibold">Spindle Cell</th>
                  <th className="py-2.5 px-3 font-semibold">Completion Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Quality Lead Certification</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Job Cost Incurred</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-aluminum/40">
                {auditHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-forge-alabaster/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-forge-black flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-forge-steel" />
                      {rec.orderNumber}
                    </td>

                    <td className="py-3 px-3 font-bold text-forge-black">
                      {rec.units} UNITS
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 bg-forge-alabaster border border-forge-aluminum text-[10px] font-bold">
                        {rec.machineId}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-forge-steel">
                      {rec.completionDate}
                    </td>

                    <td className="py-3 px-3 text-forge-steel flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{rec.verifiedBy}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-forge-black">
                      ${rec.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ChamferCard>
    </div>
  );
};
