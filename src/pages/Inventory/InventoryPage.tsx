import React, { useState } from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { MaterialStock, ToolingItem } from '../../types';
import { 
  Boxes, 
  Wrench, 
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  Search,
  CheckCircle2
} from 'lucide-react';

const INITIAL_RAW_MATERIALS: MaterialStock[] = [
  {
    id: 'MAT-01',
    name: 'Forged Round Bar',
    grade: 'En-8D / Carbon Steel',
    availableStockKg: 4200,
    minBufferKg: 1500,
    reservedStockKg: 1200,
    availableToPromiseKg: 3000,
    allocatedJob: 'JOB-2026-001 (Hydraulic Valve Housing)',
    location: 'Bay A-04 (Howrah Complex)',
    supplier: 'Tata Steel Tubes Division',
    leadTimeDays: 3,
    expectedDeliveryDate: '12-11-2026',
    reorderQuantityKg: 2000,
    status: 'HEALTHY'
  },
  {
    id: 'MAT-02',
    name: 'Cast Hollow Cylinder',
    grade: 'SS 304 Stainless',
    availableStockKg: 1850,
    minBufferKg: 800,
    reservedStockKg: 650,
    availableToPromiseKg: 1200,
    allocatedJob: 'JOB-2026-004 (Air Manifold Block)',
    location: 'Bay B-02',
    supplier: 'Jindal Stainless Ltd.',
    leadTimeDays: 5,
    expectedDeliveryDate: '15-11-2026',
    reorderQuantityKg: 1000,
    status: 'HEALTHY'
  },
  {
    id: 'MAT-03',
    name: 'Precision Hex Stock',
    grade: 'Alloy Steel En-19',
    availableStockKg: 950,
    minBufferKg: 1000,
    reservedStockKg: 450,
    availableToPromiseKg: 500,
    allocatedJob: 'JOB-2026-003 (Transmission Shaft)',
    location: 'Bay A-11',
    supplier: 'Kalyani Steels Pune',
    leadTimeDays: 7,
    expectedDeliveryDate: '14-11-2026',
    reorderQuantityKg: 800,
    status: 'LOW_STOCK'
  },
  {
    id: 'MAT-04',
    name: 'Phosphor Bronze Ingot',
    grade: 'CuSn10 Grade II',
    availableStockKg: 320,
    minBufferKg: 500,
    reservedStockKg: 240,
    availableToPromiseKg: 80,
    allocatedJob: 'JOB-2026-002 (Pump Impeller Bronze)',
    location: 'Vault 01 (High-Value Alloys)',
    supplier: 'Metallo Non-Ferrous Alloys (Kolkata)',
    leadTimeDays: 4,
    expectedDeliveryDate: '09-11-2026',
    reorderQuantityKg: 500,
    status: 'CRITICAL_SHORTAGE'
  }
];

const INITIAL_TOOLING: ToolingItem[] = [
  {
    id: 'TOOL-401',
    name: 'Seco 12mm 4-Flute End Mill',
    type: 'Solid Carbide Milling (TiAlN)',
    assignedMachine: 'VMC-01',
    condition: 'EXCELLENT',
    totalExpectedLifeMinutes: 480,
    remainingLifeMinutes: 374,
    remainingLifePct: 78,
    replacementThresholdPct: 20,
    lastReplacementDate: '04-11-2026',
    estimatedRemainingParts: 145,
    replacementInStore: 14,
    status: 'OPTIMAL'
  },
  {
    id: 'TOOL-402',
    name: 'Sandvik CoroTurn DNMG 150608',
    type: 'Turning Insert (CVD coated)',
    assignedMachine: 'CNC-04',
    condition: 'WORN',
    totalExpectedLifeMinutes: 360,
    remainingLifeMinutes: 86,
    remainingLifePct: 24,
    replacementThresholdPct: 20,
    lastReplacementDate: '02-11-2026',
    estimatedRemainingParts: 18,
    replacementInStore: 45,
    status: 'REPLACE_SOON'
  },
  {
    id: 'TOOL-403',
    name: 'Walter Titex 8.5mm Step Drill',
    type: 'High-Pressure Through-Coolant',
    assignedMachine: 'HMC-01',
    condition: 'EXCELLENT',
    totalExpectedLifeMinutes: 600,
    remainingLifeMinutes: 546,
    remainingLifePct: 91,
    replacementThresholdPct: 15,
    lastReplacementDate: '05-11-2026',
    estimatedRemainingParts: 280,
    replacementInStore: 8,
    status: 'OPTIMAL'
  },
  {
    id: 'TOOL-404',
    name: 'Kennametal M16 Thread Mill',
    type: 'Precision Threading Mill',
    assignedMachine: 'VMC-02',
    condition: 'CRITICAL',
    totalExpectedLifeMinutes: 240,
    remainingLifeMinutes: 28,
    remainingLifePct: 12,
    replacementThresholdPct: 20,
    lastReplacementDate: '30-10-2026',
    estimatedRemainingParts: 6,
    replacementInStore: 3,
    status: 'REPLACE_SOON'
  }
];

export const InventoryPage: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialStock[]>(INITIAL_RAW_MATERIALS);
  const [tools, setTools] = useState<ToolingItem[]>(INITIAL_TOOLING);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'materials' | 'tooling'>('materials');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Trigger Reorder Action
  const handleReorder = (matId: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            status: 'INCOMING',
            availableStockKg: m.availableStockKg + m.reorderQuantityKg,
            availableToPromiseKg: (m.availableStockKg + m.reorderQuantityKg) - m.reservedStockKg
          };
        }
        return m;
      })
    );
    const target = materials.find(m => m.id === matId);
    setActionFeedback(`PO dispatched to ${target?.supplier} for ${target?.reorderQuantityKg}kg.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Record Tool Replacement
  const handleReplaceTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => {
        if (t.id === toolId && t.replacementInStore > 0) {
          return {
            ...t,
            remainingLifePct: 100,
            remainingLifeMinutes: t.totalExpectedLifeMinutes,
            condition: 'EXCELLENT',
            status: 'OPTIMAL',
            replacementInStore: t.replacementInStore - 1,
            lastReplacementDate: 'Just now'
          };
        }
        return t;
      })
    );
    setActionFeedback(`Tool offset touch-off calibrated on spindle for ${toolId}. Backup inventory decremented.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const criticalShortageMat = materials.find(m => m.status === 'CRITICAL_SHORTAGE');
  const criticalShortageAmount = criticalShortageMat ? (criticalShortageMat.minBufferKg - criticalShortageMat.availableStockKg) : 0;

  const replaceSoonCount = tools.filter(t => t.status === 'REPLACE_SOON' || t.remainingLifePct <= t.replacementThresholdPct).length;
  const totalRawStockKg = materials.reduce((sum, m) => sum + m.availableStockKg, 0);

  return (
    <div className="space-y-6">
      {/* 1. Inventory KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          category="RAW BILLET STORES"
          value={`${totalRawStockKg.toLocaleString()} kg`}
          unit="ON HAND"
          subtext="Available across Bay A, B & Vault"
          accentColor="emerald"
          badge="STAGED STOCK"
        />

        <MetricCard
          category="TOOL WEAR REPLACEMENTS"
          value={replaceSoonCount}
          unit="SPINDLES"
          subtext="VMC-02 & CNC-04 at replacement limit"
          trend={{ value: "2 Needs Attention", isPositive: false }}
          accentColor="orange"
          badge="TOOL WEAR"
        />

        <MetricCard
          category="BUFFER COMPLIANCE"
          value="94.2%"
          subtext="Minimum safety threshold met"
          trend={{ value: "Target: 90%", isPositive: true }}
          accentColor="emerald"
          badge="SAFETY BUFFER"
        />

        <MetricCard
          category="CRITICAL SHORTAGE"
          value={criticalShortageAmount > 0 ? `-${criticalShortageAmount} kg` : '0 kg'}
          unit={criticalShortageMat ? criticalShortageMat.grade : 'NONE'}
          subtext={criticalShortageMat ? `Allocated to ${criticalShortageMat.allocatedJob}` : 'All safety buffers fulfilled'}
          accentColor={criticalShortageAmount > 0 ? 'orange' : 'emerald'}
          badge="SHORTFALL"
        />
      </div>

      {/* 2. Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 3. OPERATIONAL SHORTAGE ALERT (Phase 7 Example) */}
      {criticalShortageMat && criticalShortageAmount > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 font-mono text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-300 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
              <span className="font-bold text-rose-950 uppercase tracking-wide">
                CRITICAL INVENTORY SHORTAGE ALERT: {criticalShortageMat.name} ({criticalShortageMat.grade})
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-rose-600 text-white font-bold uppercase">
              SHORTFALL: {criticalShortageAmount} KG
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-rose-950">
            <div>
              <span className="text-forge-steel text-[10px] block">AVAILABLE VS MINIMUM BUFFER</span>
              <strong>{criticalShortageMat.availableStockKg} kg on hand</strong> (Min required: {criticalShortageMat.minBufferKg} kg)
            </div>
            <div>
              <span className="text-forge-steel text-[10px] block">ALLOCATED WORK ORDER AT RISK</span>
              <strong>{criticalShortageMat.allocatedJob}</strong>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <button
                type="button"
                onClick={() => handleReorder(criticalShortageMat.id)}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>EXPEDITE PO ({criticalShortageMat.reorderQuantityKg} KG)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Inventory Management Container */}
      <ChamferCard
        title="INVENTORY & TOOLING REGISTRY"
        tag="HOWRAH STORES & TOOL CRIB"
        action={
          <div className="flex items-center gap-2">
            <div className="flex border border-forge-aluminum bg-white" role="group" aria-label="Inventory section switcher">
              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                aria-pressed={activeTab === 'materials'}
                className={`px-3 py-1 text-xs font-mono transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  activeTab === 'materials'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" aria-hidden="true" />
                <span>RAW MATERIALS ({materials.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tooling')}
                aria-pressed={activeTab === 'tooling'}
                className={`px-3 py-1 text-xs font-mono transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  activeTab === 'tooling'
                    ? 'bg-forge-black text-white font-semibold'
                    : 'text-forge-steel hover:text-forge-black'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                <span>TOOLING & INSERTS ({tools.length})</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 font-mono">
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-forge-steel absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search alloy grade, tool ID, or work order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-forge-alabaster border border-forge-aluminum text-xs font-mono text-forge-black placeholder:text-forge-steel/70 focus:outline-none focus:border-forge-orange focus:bg-white"
            />
          </div>

          {activeTab === 'materials' ? (
            /* RAW MATERIALS TABLE (Phase 7 Requirements) */
            <div 
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange" 
              tabIndex={0} 
              role="region" 
              aria-label="Raw material billet inventory"
            >
              <table className="w-full text-left font-mono text-xs border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-forge-aluminum bg-forge-alabaster/60 text-[10px] text-forge-steel uppercase tracking-wider">
                    <th scope="col" className="p-3 font-semibold">Material / Grade</th>
                    <th scope="col" className="p-3 font-semibold text-right">Available Stock</th>
                    <th scope="col" className="p-3 font-semibold text-right">Reserved Stock</th>
                    <th scope="col" className="p-3 font-semibold text-right">Avail-to-Promise (ATP)</th>
                    <th scope="col" className="p-3 font-semibold text-right">Min Buffer</th>
                    <th scope="col" className="p-3 font-semibold">Allocated Work Order</th>
                    <th scope="col" className="p-3 font-semibold">Supplier / Lead Time</th>
                    <th scope="col" className="p-3 font-semibold text-center">Status</th>
                    <th scope="col" className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forge-aluminum/40">
                  {materials
                    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.grade.toLowerCase().includes(search.toLowerCase()))
                    .map((mat) => {
                      const shortfall = mat.availableStockKg < mat.minBufferKg ? (mat.minBufferKg - mat.availableStockKg) : 0;
                      return (
                        <tr key={mat.id} className="hover:bg-forge-alabaster/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-forge-black">{mat.name}</div>
                            <div className="text-[10px] text-forge-steel font-sans">{mat.grade} • {mat.location}</div>
                          </td>

                          <td className="p-3 text-right font-bold text-forge-black">
                            {mat.availableStockKg.toLocaleString()} kg
                          </td>

                          <td className="p-3 text-right text-forge-steel">
                            {mat.reservedStockKg.toLocaleString()} kg
                          </td>

                          <td className="p-3 text-right font-bold text-emerald-900 bg-emerald-50/50">
                            {mat.availableToPromiseKg.toLocaleString()} kg
                          </td>

                          <td className="p-3 text-right text-forge-steel">
                            {mat.minBufferKg.toLocaleString()} kg
                            {shortfall > 0 && (
                              <span className="block text-[9px] text-rose-700 font-bold">
                                (-{shortfall}kg)
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-forge-orange font-semibold text-[11px]">
                            {mat.allocatedJob}
                          </td>

                          <td className="p-3 text-[11px] text-forge-steel">
                            <span className="text-forge-black font-semibold block">{mat.supplier}</span>
                            <span>{mat.leadTimeDays}d lead • ETA: {mat.expectedDeliveryDate || 'Standard'}</span>
                          </td>

                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold border uppercase ${
                              mat.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              mat.status === 'LOW_STOCK' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                              mat.status === 'CRITICAL_SHORTAGE' ? 'bg-rose-50 text-rose-900 border-rose-300' :
                              'bg-blue-50 text-blue-900 border-blue-300'
                            }`}>
                              {mat.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleReorder(mat.id)}
                              className="px-2 py-1 bg-forge-black text-white text-[10px] uppercase font-semibold hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
                            >
                              Reorder
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            /* TOOLING INVENTORY TABLE (Phase 7 Requirements) */
            <div 
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange" 
              tabIndex={0} 
              role="region" 
              aria-label="CNC spindle tooling status"
            >
              <table className="w-full text-left font-mono text-xs border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-forge-aluminum bg-forge-alabaster/60 text-[10px] text-forge-steel uppercase tracking-wider">
                    <th scope="col" className="p-3 font-semibold">Tool Identifier</th>
                    <th scope="col" className="p-3 font-semibold">Type</th>
                    <th scope="col" className="p-3 font-semibold">Assigned Spindle</th>
                    <th scope="col" className="p-3 font-semibold">Life Remaining</th>
                    <th scope="col" className="p-3 font-semibold text-right">Parts Remaining</th>
                    <th scope="col" className="p-3 font-semibold text-right">Crib Stock</th>
                    <th scope="col" className="p-3 font-semibold text-center">Condition</th>
                    <th scope="col" className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forge-aluminum/40">
                  {tools
                    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.assignedMachine.toLowerCase().includes(search.toLowerCase()))
                    .map((tool) => {
                      const isWarning = tool.remainingLifePct <= tool.replacementThresholdPct;
                      return (
                        <tr key={tool.id} className={`hover:bg-forge-alabaster/40 transition-colors ${
                          isWarning ? 'bg-amber-50/20' : ''
                        }`}>
                          <td className="p-3">
                            <div className="font-bold text-forge-black">{tool.name}</div>
                            <div className="text-[10px] text-forge-steel">{tool.id} • Swapped: {tool.lastReplacementDate}</div>
                          </td>

                          <td className="p-3 text-forge-steel font-sans text-[11px]">
                            {tool.type}
                          </td>

                          <td className="p-3 font-bold text-forge-black">
                            {tool.assignedMachine}
                          </td>

                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-forge-aluminum/40 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      tool.remainingLifePct > 50 ? 'bg-emerald-500' :
                                      tool.remainingLifePct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${tool.remainingLifePct}%` }}
                                  />
                                </div>
                                <span className={`font-bold ${isWarning ? 'text-amber-900' : 'text-forge-black'}`}>
                                  {tool.remainingLifePct}%
                                </span>
                              </div>
                              <div className="text-[9px] text-forge-steel">
                                {tool.remainingLifeMinutes}m / {tool.totalExpectedLifeMinutes}m
                                {isWarning && <span className="text-rose-700 font-bold ml-1">(Limit: &le;{tool.replacementThresholdPct}%)</span>}
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-right font-bold text-forge-black">
                            ~{tool.estimatedRemainingParts} pcs
                          </td>

                          <td className="p-3 text-right text-forge-steel">
                            {tool.replacementInStore} pcs
                          </td>

                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold border uppercase ${
                              tool.condition === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              tool.condition === 'WORN' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                              tool.condition === 'CRITICAL' ? 'bg-rose-50 text-rose-900 border-rose-300' :
                              'bg-slate-100 text-slate-800 border-slate-300'
                            }`}>
                              {tool.condition}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleReplaceTool(tool.id)}
                              className="px-2 py-1 bg-forge-orange text-white text-[10px] uppercase font-semibold hover:bg-forge-orange-hover transition-colors flex items-center gap-1 ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                            >
                              <RotateCcw className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>Swap</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ChamferCard>
    </div>
  );
};
