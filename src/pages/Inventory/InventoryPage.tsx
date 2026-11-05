import React from 'react';
import { ChamferCard } from '../../components/ui/ChamferCard';
import { Boxes, Package, Wrench, AlertCircle } from 'lucide-react';

interface MaterialStock {
  id: string;
  name: string;
  grade: string;
  stockKg: number;
  minBufferKg: number;
  allocatedJob: string;
  location: string;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
}

interface ToolingItem {
  id: string;
  name: string;
  type: string;
  remainingLifePct: number;
  spindleAssigned: string;
  replacementInStore: number;
  status: 'OPTIMAL' | 'REPLACE_SOON' | 'EXHAUSTED';
}

const RAW_MATERIALS: MaterialStock[] = [
  { id: 'MAT-01', name: 'Forged Round Bar', grade: 'En-8D / Carbon Steel', stockKg: 4200, minBufferKg: 1500, allocatedJob: 'WO-8421 (Bracket)', location: 'Bay A-04', status: 'OPTIMAL' },
  { id: 'MAT-02', name: 'Cast Hollow Cylinder', grade: 'SS 304 Stainless', stockKg: 1850, minBufferKg: 800, allocatedJob: 'WO-8420 (Housing)', location: 'Bay B-02', status: 'OPTIMAL' },
  { id: 'MAT-03', name: 'Precision Hex Stock', grade: 'Alloy Steel En-19', stockKg: 950, minBufferKg: 1000, allocatedJob: 'WO-8419 (Shaft)', location: 'Bay A-11', status: 'LOW' },
  { id: 'MAT-04', name: 'Phosphor Bronze Ingot', grade: 'CuSn10 Grade II', stockKg: 320, minBufferKg: 500, allocatedJob: 'JOB-2026-002 (Impeller)', location: 'Vault 01', status: 'CRITICAL' }
];

const TOOLING_INVENTORY: ToolingItem[] = [
  { id: 'TOOL-401', name: 'Seco 12mm 4-Flute End Mill', type: 'Solid Carbide Milling', remainingLifePct: 78, spindleAssigned: 'VMC-01', replacementInStore: 14, status: 'OPTIMAL' },
  { id: 'TOOL-402', name: 'Sandvik CoroTurn DNMG 150608', type: 'Turning Insert (CVD coated)', remainingLifePct: 24, spindleAssigned: 'CNC-04', replacementInStore: 45, status: 'REPLACE_SOON' },
  { id: 'TOOL-403', name: 'Walter Titex 8.5mm Step Drill', type: 'High-Pressure Through-Coolant', remainingLifePct: 91, spindleAssigned: 'HMC-01', replacementInStore: 8, status: 'OPTIMAL' },
  { id: 'TOOL-404', name: 'Kennametal M16 Thread Mill', type: 'Precision Threading', remainingLifePct: 12, spindleAssigned: 'VMC-02', replacementInStore: 3, status: 'REPLACE_SOON' }
];

export const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-forge-aluminum">
          <div className="flex items-center justify-between text-forge-steel font-mono text-xs">
            <span>BILLET STORES</span>
            <Boxes className="w-4 h-4 text-forge-orange" aria-hidden="true" />
          </div>
          <div className="font-display font-bold text-2xl text-forge-black mt-2">7,320 kg</div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1">4 Active Alloys Staged</div>
        </div>

        <div className="p-4 bg-white border border-forge-aluminum">
          <div className="flex items-center justify-between text-forge-steel font-mono text-xs">
            <span>TOOLING INSERTS</span>
            <Wrench className="w-4 h-4 text-forge-steel" aria-hidden="true" />
          </div>
          <div className="font-display font-bold text-2xl text-forge-black mt-2">428 Units</div>
          <div className="text-[11px] text-forge-steel font-mono mt-1">Sandvik / Seco / Walter</div>
        </div>

        <div className="p-4 bg-white border border-forge-aluminum">
          <div className="flex items-center justify-between text-forge-steel font-mono text-xs">
            <span>TOOL WEAR ALERTS</span>
            <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div className="font-display font-bold text-2xl text-amber-700 mt-2">2 Replace Soon</div>
          <div className="text-[11px] text-amber-800 font-mono mt-1">Spindle CNC-04 & VMC-02</div>
        </div>

        <div className="p-4 bg-white border border-forge-aluminum">
          <div className="flex items-center justify-between text-forge-steel font-mono text-xs">
            <span>BUFFER COMPLIANCE</span>
            <Package className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="font-display font-bold text-2xl text-forge-black mt-2">94.2%</div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1">HMLV Stock Ready</div>
        </div>
      </div>

      {/* Raw Materials Table */}
      <ChamferCard title="Raw Material Billet Inventory">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Raw material billet inventory">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-forge-aluminum bg-forge-alabaster/60 text-[11px] text-forge-steel">
                <th scope="col" className="p-3 font-semibold">MATERIAL / GRADE</th>
                <th scope="col" className="p-3 font-semibold">ON HAND</th>
                <th scope="col" className="p-3 font-semibold">MIN BUFFER</th>
                <th scope="col" className="p-3 font-semibold">ALLOCATED WORK ORDER</th>
                <th scope="col" className="p-3 font-semibold">BAY LOCATION</th>
                <th scope="col" className="p-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-aluminum/40">
              {RAW_MATERIALS.map((mat) => (
                <tr key={mat.id} className="hover:bg-forge-alabaster/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-forge-black">{mat.name}</div>
                    <div className="text-[10px] text-forge-steel font-sans">{mat.grade}</div>
                  </td>
                  <td className="p-3 font-bold text-forge-black">{mat.stockKg.toLocaleString()} kg</td>
                  <td className="p-3 text-forge-steel">{mat.minBufferKg.toLocaleString()} kg</td>
                  <td className="p-3 text-forge-orange font-semibold">{mat.allocatedJob}</td>
                  <td className="p-3 text-forge-steel">{mat.location}</td>
                  <td className="p-3 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                      mat.status === 'OPTIMAL' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      mat.status === 'LOW' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                      'bg-rose-50 text-rose-900 border-rose-300'
                    }`}>
                      {mat.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChamferCard>

      {/* Tooling Inventory Table */}
      <ChamferCard title="CNC Spindle Tooling & Inserts Status">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="CNC spindle tooling status">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-forge-aluminum bg-forge-alabaster/60 text-[11px] text-forge-steel">
                <th scope="col" className="p-3 font-semibold">TOOL IDENTIFIER</th>
                <th scope="col" className="p-3 font-semibold">TYPE</th>
                <th scope="col" className="p-3 font-semibold">TOOL LIFE REMAINING</th>
                <th scope="col" className="p-3 font-semibold">CURRENT SPINDLE</th>
                <th scope="col" className="p-3 font-semibold">BACKUP STOCK</th>
                <th scope="col" className="p-3 font-semibold text-right">CONDITION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-aluminum/40">
              {TOOLING_INVENTORY.map((tool) => (
                <tr key={tool.id} className="hover:bg-forge-alabaster/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-forge-black">{tool.name}</div>
                    <div className="text-[10px] text-forge-steel">{tool.id}</div>
                  </td>
                  <td className="p-3 text-forge-steel font-sans">{tool.type}</td>
                  <td className="p-3">
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
                      <span className="font-bold text-forge-black">{tool.remainingLifePct}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-forge-black font-bold">{tool.spindleAssigned}</td>
                  <td className="p-3 text-forge-steel">{tool.replacementInStore} pcs</td>
                  <td className="p-3 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                      tool.status === 'OPTIMAL' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      'bg-amber-50 text-amber-900 border-amber-300'
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChamferCard>
    </div>
  );
};
