import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { OeeComponentBreakdown } from '../../components/ui/OeeComponentBreakdown';
import { AuditRecord } from '../../types';
import { Download, ShieldCheck, CheckCircle2, FileText, Filter, Calendar } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface ReportsPageProps {
  auditHistory: AuditRecord[];
}

interface DowntimeDrilldownEvent {
  category: string;
  machineId: string;
  durationMinutes: number;
  reason: string;
  time: string;
  investigator: string;
}

const DOWNTIME_EVENTS: DowntimeDrilldownEvent[] = [
  { category: "SETUP", machineId: "CNC-04", durationMinutes: 80, reason: "4-Jaw chuck dial-in & soft jaw boring ring", time: "13:30 IST", investigator: "Sourav Das (Supervisor)" },
  { category: "SETUP", machineId: "VMC-05", durationMinutes: 65, reason: "Heavy vise zero-point realignment & shimming", time: "11:30 IST", investigator: "Rakesh Yadav (Operator)" },
  { category: "SETUP", machineId: "HMC-04", durationMinutes: 40, reason: "Tombstone twin-pallet clamping check", time: "10:00 IST", investigator: "Partha Sarkar (Operator)" },
  { category: "COOLANT", machineId: "VMC-02", durationMinutes: 75, reason: "Coolant pressure drop (<10 bar); duplex strainer swarf clog", time: "14:12 IST", investigator: "Vikram Singh (Maint. Tech)" },
  { category: "COOLANT", machineId: "HMC-01", durationMinutes: 45, reason: "Bearing thermal elevation (78.2°C); chiller clean", time: "13:45 IST", investigator: "Vikram Singh (Maint. Tech)" },
  { category: "TOOL_WEAR", machineId: "CNC-07", durationMinutes: 50, reason: "CNMG 120408 roughing insert pocket #12 index", time: "12:50 IST", investigator: "Dipak Dutta (Operator)" },
  { category: "TOOL_WEAR", machineId: "VMC-02", durationMinutes: 30, reason: "Kennametal M16 thread mill wear touch-off", time: "09:30 IST", investigator: "Amit Kumar (Operator)" },
  { category: "SWARF", machineId: "VMC-08", durationMinutes: 40, reason: "Bed swarf clearance and chip conveyor flush", time: "09:45 IST", investigator: "Manoj Sharma (Operator)" },
  { category: "SWARF", machineId: "LATHE-02", durationMinutes: 25, reason: "Headstock swarf apron cleaning", time: "11:00 IST", investigator: "Joydeb Samanta (Operator)" },
];

export const ReportsPage: React.FC<ReportsPageProps> = ({ auditHistory }) => {
  const [timeframe, setTimeframe] = useState<'SHIFT_01' | 'SHIFT_PREV' | 'TODAY' | 'LAST_7D' | 'LAST_30D'>('SHIFT_01');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('ALL');
  const [configuredTarget, setConfiguredTarget] = useState<number>(85.0);
  const [activeDrilldownCategory, setActiveDrilldownCategory] = useState<string | null>(null);

  const filteredHistory = auditHistory.filter((rec) => {
    if (selectedMachineFilter !== 'ALL' && rec.machineId !== selectedMachineFilter) {
      return false;
    }
    return true;
  });

  const cumulativeValue = filteredHistory.reduce((sum, r) => sum + r.totalCost, 0);

  const handleExportCSV = () => {
    const headers = [
      'Work Order',
      'Customer',
      'Completed Pieces',
      'Spindle Cell',
      'Completion Date (IST)',
      'Quality Lead (QC)',
      'Job Value (INR)',
      'Delivery Challan',
      'HSN Classification',
      'Compliance Standard'
    ];

    const rows = filteredHistory.map(r => [
      r.orderNumber,
      `"${r.customerName || 'Eastern Industrial Client'}"`,
      r.units,
      r.machineId,
      `"${r.completionDate}"`,
      `"${r.verifiedBy}"`,
      r.totalCost,
      `"${r.challanNumber || 'DC-2026/HOW'}"`,
      `"${r.hsnCode || '8481'}"`,
      `"ISO 9001 Process Record"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FORGEOS_Production_Audit_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const factoryOee = {
    overall: 84.8,
    availability: 89.4,
    performance: 95.2,
    quality: 99.6
  };

  const downtimeLossCategories = [
    { key: "SETUP", label: "SETUP & FIXTURE DIAL-IN (CHUCK/JAWS)", minutes: 185, pct: 41, color: "bg-blue-600" },
    { key: "COOLANT", label: "COOLANT PRESSURE & THERMAL ALARMS", minutes: 120, pct: 27, color: "bg-rose-600" },
    { key: "TOOL_WEAR", label: "TOOL WEAR TOUCH-OFF & INSERT SWAP", minutes: 80, pct: 18, color: "bg-amber-500" },
    { key: "SWARF", label: "SWARF CLEARANCE & BED CLEANING", minutes: 65, pct: 14, color: "bg-slate-500" },
  ];

  const filteredDrilldownEvents = activeDrilldownCategory
    ? DOWNTIME_EVENTS.filter(e => e.category === activeDrilldownCategory)
    : DOWNTIME_EVENTS;

  return (
    <div className="space-y-6">
      {/* 1. Historical Analytics Controls Toolbar */}
      <div className="bg-white border border-forge-aluminum p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center gap-1.5 text-forge-steel">
            <Calendar className="w-3.5 h-3.5 text-forge-black" aria-hidden="true" />
            <span className="font-semibold uppercase text-[10px]">TIME WINDOW:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              aria-label="Filter historical analytics by timeframe"
              className="bg-forge-alabaster border border-forge-aluminum px-2 py-1 text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange"
            >
              <option value="SHIFT_01">Current Shift 01 (06:00 - 14:00 IST)</option>
              <option value="SHIFT_PREV">Previous Shift 03 (22:00 - 06:00 IST)</option>
              <option value="TODAY">Today (All 3 Shifts)</option>
              <option value="LAST_7D">Last 7 Days (Howrah Complex)</option>
              <option value="LAST_30D">Last 30 Days (Monthly Production)</option>
            </select>
          </div>

          {/* Spindle Cell Filter */}
          <div className="flex items-center gap-1.5 text-forge-steel">
            <Filter className="w-3.5 h-3.5 text-forge-black" aria-hidden="true" />
            <span className="font-semibold uppercase text-[10px]">SPINDLE CELL:</span>
            <select
              value={selectedMachineFilter}
              onChange={(e) => setSelectedMachineFilter(e.target.value)}
              aria-label="Filter audit records by machine"
              className="bg-forge-alabaster border border-forge-aluminum px-2 py-1 text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange"
            >
              <option value="ALL">All Machines (24 Spindles)</option>
              <option value="VMC-01">VMC-01 (3-Axis Production)</option>
              <option value="VMC-02">VMC-02 (5-Axis DMU 50)</option>
              <option value="VMC-03">VMC-03 (VF-2SS High-Speed)</option>
              <option value="CNC-01">CNC-01 (Quick Turn Mill-Turn)</option>
              <option value="CNC-05">CNC-05 (Haas ST-20Y)</option>
              <option value="HMC-01">HMC-01 (Makino a61nx)</option>
            </select>
          </div>
        </div>

        {/* Configurable OEE Target Selector */}
        <div className="flex items-center gap-1.5 text-forge-steel text-[10px]">
          <span>CONFIGURED BENCHMARK TARGET:</span>
          <select
            value={configuredTarget}
            onChange={(e) => setConfiguredTarget(parseFloat(e.target.value))}
            aria-label="Configure OEE target benchmark"
            className="bg-forge-alabaster border border-forge-aluminum px-2 py-1 text-xs font-mono text-forge-black focus:outline-none focus:border-forge-orange font-bold"
          >
            <option value="85.0">Facility Target: 85.0%</option>
            <option value="88.0">VMC 5-Axis Line: 88.0%</option>
            <option value="82.0">Heavy HMC Line: 82.0%</option>
            <option value="80.0">Manual Turning Cell: 80.0%</option>
          </select>
        </div>
      </div>

      {/* 2. Reports KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="AUDITED BATCHES"
          value={filteredHistory.length}
          unit="ORDERS"
          subtext="100% CMM verified batches"
          accentColor="emerald"
          badge="AUDITED"
        />

        <MetricCard
          category="CUMULATIVE BATCH VALUE"
          value={formatINR(cumulativeValue)}
          subtext="Verified dispatched orders (Howrah)"
          accentColor="emerald"
          badge="INR VALUE"
        />

        <MetricCard
          category="TOLERANCE ADHERENCE"
          value="99.6%"
          subtext="Calculated according to ISO 22400"
          trend={{ value: "Zero Rejections", isPositive: true }}
          accentColor="emerald"
          badge="PROCESS QUALITY"
        />

        <MetricCard
          category="COMPLIANCE RECORD"
          value="VERIFIED"
          subtext="Timestamped audit history"
          accentColor="black"
          badge="AUDIT READY"
        />
      </div>

      {/* 3. Graphical Performance Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Factory OEE Breakdown */}
        <div className="lg:col-span-7">
          <OeeComponentBreakdown
            oee={factoryOee}
            targetOee={configuredTarget}
            title="FACTORY-WIDE OEE • HOWRAH FACILITY (SHIFT 01 IST)"
            showFormula={true}
          />
        </div>

        {/* Downtime Pareto Loss Classification */}
        <div className="lg:col-span-5">
          <ChamferCard
            title="DOWNTIME PARETO CLASSIFICATION"
            tag="SEMI E10 LOSS CATEGORIES"
            action={
              <span className="font-mono text-[10px] text-forge-steel font-semibold">
                SHIFT 01: 450 MIN TOTAL
              </span>
            }
          >
            <div className="space-y-3 font-mono text-xs">
              <p className="font-sans text-xs text-forge-steel leading-relaxed">
                Equipment loss distribution categorized per SEMI E10 standards. Click any bar to drill down into specific machine downtime events.
              </p>

              <div className="space-y-2.5 pt-1">
                {downtimeLossCategories.map((cat) => {
                  const isSelected = activeDrilldownCategory === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => setActiveDrilldownCategory(isSelected ? null : cat.key)}
                      aria-label={`Drill down into ${cat.label}: ${cat.minutes} minutes (${cat.pct}%)`}
                      className={`w-full text-left p-2 border transition-all ${
                        isSelected 
                          ? 'border-forge-black bg-forge-alabaster ring-1 ring-forge-black shadow-sm' 
                          : 'border-transparent hover:border-forge-aluminum hover:bg-forge-alabaster/50'
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center text-[11px] gap-1 mb-1">
                        <span className="font-bold text-forge-black">{cat.label}</span>
                        <span className="text-forge-steel font-bold">{cat.minutes}m ({cat.pct}%)</span>
                      </div>
                      <div 
                        role="progressbar"
                        aria-valuenow={cat.pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${cat.label}: ${cat.minutes} minutes (${cat.pct}%)`}
                        className="h-3 bg-forge-alabaster border border-forge-aluminum overflow-hidden flex items-center"
                      >
                        <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Drilldown incident view */}
              {activeDrilldownCategory && (
                <div className="p-3 bg-forge-alabaster border border-forge-aluminum space-y-2 mt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase text-forge-black">
                      DRILL-DOWN: {activeDrilldownCategory} INCIDENTS ({filteredDrilldownEvents.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDrilldownCategory(null)}
                      className="text-[9px] text-forge-orange hover:underline font-bold"
                    >
                      CLEAR DRILL-DOWN
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[10px]">
                    {filteredDrilldownEvents.map((evt, idx) => (
                      <div key={idx} className="p-1.5 bg-white border border-forge-aluminum/60 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-forge-black">{evt.machineId}</strong>: {evt.reason}
                          <span className="text-forge-steel block text-[9px]">{evt.time} • Investigator: {evt.investigator}</span>
                        </div>
                        <span className="font-bold text-rose-700 flex-shrink-0">+{evt.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-forge-aluminum/40 text-[10px] text-forge-steel flex flex-wrap justify-between gap-1">
                <span>CONFIGURED SHIFT BUDGET: &lt; 380 MIN</span>
                <span className="font-bold text-amber-900">+70 MIN VARIANCE</span>
              </div>
            </div>
          </ChamferCard>
        </div>
      </div>

      {/* 4. Production Audit Trail Table */}
      <ChamferCard
        title="HISTORICAL PRODUCTION AUDIT TRAIL & QUALITY VERIFICATION"
        tag="HOWRAH DISPATCH LOG"
        action={
          <button
            type="button"
            onClick={handleExportCSV}
            aria-label="Export audit history records as CSV file"
            className="px-3 py-1.5 bg-forge-black text-white hover:bg-zinc-800 text-xs font-mono font-semibold uppercase flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <Download className="w-3.5 h-3.5 text-forge-orange" aria-hidden="true" />
            EXPORT AUDIT CSV (INR)
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
              <span>Timestamped operational audit records verified with operator credentials, spindle ID, and CMM inspection logs.</span>
            </div>
            <span className="font-bold flex-shrink-0 bg-white px-2 py-0.5 border border-emerald-400">DESIGNED FOR GST & ISO 9001 AUDITS</span>
          </div>

          <div 
            className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
            tabIndex={0}
            role="region"
            aria-label="Historical production audit trail and compliance table (scrollable horizontally)"
          >
            <table className="w-full text-left font-mono text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-forge-aluminum text-[10px] text-forge-steel uppercase tracking-wider bg-forge-alabaster/50">
                  <th scope="col" className="py-2.5 px-3 font-semibold">Work Order / Customer</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">Completed Pieces</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">Spindle Cell</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">Completion (IST)</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">Quality Lead (QC)</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">Delivery Challan / HSN</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-right">Job Value (INR)</th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-aluminum/40">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-forge-alabaster/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-forge-black">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-forge-steel flex-shrink-0" aria-hidden="true" />
                        <div>
                          <span>{rec.orderNumber}</span>
                          {rec.customerName && (
                            <span className="block text-[9px] text-forge-steel font-normal">
                              {rec.customerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-forge-black">
                      {rec.units} PCS
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                      <span>{rec.verifiedBy}</span>
                    </td>

                    <td className="py-3 px-3 text-forge-steel text-[11px]">
                      <div>{rec.challanNumber || 'DC-2026/HOW'}</div>
                      <div className="text-[9px] text-forge-steel/70">HSN: {rec.hsnCode || '8481'}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-forge-black">
                      {formatINR(rec.totalCost, true)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold">
                        VERIFIED
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
