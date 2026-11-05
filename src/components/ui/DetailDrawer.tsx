import React from 'react';
import { X } from 'lucide-react';
import { Machine, Job } from '../../types';
import { StatusBadge } from './StatusBadge';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  job?: Job | null;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  machine,
  job
}) => {
  if (!isOpen || (!machine && !job)) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-forge-aluminum h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-forge-aluminum flex items-center justify-between bg-forge-alabaster">
          <div>
            <span className="font-mono text-[10px] uppercase text-forge-steel tracking-wider font-semibold block">
              {machine ? 'SPINDLE TELEMETRY DETAIL' : 'MANUFACTURING WORK ORDER'}
            </span>
            <h2 className="font-display font-bold text-lg text-forge-black">
              {machine ? `${machine.id} • ${machine.name}` : `${job?.orderNumber} • ${job?.partName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white border border-forge-aluminum text-forge-steel hover:text-forge-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {machine && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 bg-forge-alabaster border border-forge-aluminum">
                <div>
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Machine State</span>
                  <StatusBadge type="machine" status={machine.state} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Data Stream</span>
                  <StatusBadge type="connection" status={machine.connectionState} />
                </div>
              </div>

              {/* OEE Breakdown */}
              <div className="border border-forge-aluminum p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-forge-aluminum/40 pb-2">
                  <span className="font-mono text-xs font-bold text-forge-black uppercase">
                    OEE BREAKDOWN
                  </span>
                  <span className="font-display font-bold text-lg text-emerald-700">
                    {machine.oee.overall}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="p-2 bg-forge-alabaster border border-forge-aluminum">
                    <span className="text-[10px] text-forge-steel block">AVAILABILITY</span>
                    <span className="font-bold text-forge-black">{machine.oee.availability}%</span>
                  </div>
                  <div className="p-2 bg-forge-alabaster border border-forge-aluminum">
                    <span className="text-[10px] text-forge-steel block">PERFORMANCE</span>
                    <span className="font-bold text-forge-black">{machine.oee.performance}%</span>
                  </div>
                  <div className="p-2 bg-forge-alabaster border border-forge-aluminum">
                    <span className="text-[10px] text-forge-steel block">QUALITY</span>
                    <span className="font-bold text-forge-black">{machine.oee.quality}%</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-forge-steel">
                  Formula: Availability × Performance × Quality = Grounded Shop Standard.
                </div>
              </div>

              {/* Real-time Telemetry parameters */}
              <div className="border border-forge-aluminum p-4 space-y-3">
                <span className="font-mono text-xs font-bold text-forge-black uppercase block border-b border-forge-aluminum/40 pb-2">
                  CNC SENSOR CHANNELS
                </span>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                    <span className="text-forge-steel">Spindle Speed:</span>
                    <span className="font-bold text-forge-black">{machine.spindleRpm.toLocaleString()} RPM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                    <span className="text-forge-steel">Feed Rate:</span>
                    <span className="font-bold text-forge-black">{machine.feedRateMmpm} mm/min</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                    <span className="text-forge-steel">Feed Override:</span>
                    <span className="font-bold text-forge-black">{machine.feedOverridePct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                    <span className="text-forge-steel">Current Operator:</span>
                    <span className="font-bold text-forge-black">{machine.operator}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                    <span className="text-forge-steel">Active Job:</span>
                    <span className="font-bold text-forge-orange">{machine.currentJobId || 'None (Idle)'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-forge-steel">State Duration:</span>
                    <span className="font-bold text-forge-black">{machine.lastStateChange}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {job && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 bg-forge-alabaster border border-forge-aluminum">
                <div>
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Workflow State</span>
                  <StatusBadge type="production" status={job.state} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-forge-steel uppercase block">Priority</span>
                  <span className="font-mono text-xs font-bold text-forge-orange">{job.priority}</span>
                </div>
              </div>

              {/* Part & Material Info */}
              <div className="border border-forge-aluminum p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                  <span className="text-forge-steel">Part Number:</span>
                  <span className="font-bold text-forge-black">{job.partNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                  <span className="text-forge-steel">Material:</span>
                  <span className="font-bold text-forge-black">{job.material}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                  <span className="text-forge-steel">Target Spindle:</span>
                  <span className="font-bold text-forge-black">{job.targetMachineId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-forge-aluminum/30">
                  <span className="text-forge-steel">Quantity:</span>
                  <span className="font-bold text-forge-black">{job.quantityCompleted} / {job.quantityTarget} units</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-forge-steel">Verified Unit Cost:</span>
                  <span className="font-bold text-forge-orange">${job.verifiedUnitCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Operations Progress Routing */}
              {job.operations && (
                <div className="border border-forge-aluminum p-4 space-y-3">
                  <span className="font-mono text-xs font-bold text-forge-black uppercase block border-b border-forge-aluminum/40 pb-2">
                    OPERATION ROUTING
                  </span>
                  <div className="space-y-2">
                    {job.operations.map((op) => (
                      <div key={op.id} className="p-2 border border-forge-aluminum text-xs font-mono flex items-center justify-between">
                        <div>
                          <div className="font-bold text-forge-black">
                            Op {op.stepNumber}: {op.name}
                          </div>
                          <div className="text-[10px] text-forge-steel">
                            Cell: {op.machineType} • Planned: {op.plannedMinutes}m
                          </div>
                        </div>
                        <StatusBadge type="production" status={op.state} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-forge-aluminum bg-forge-alabaster flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-forge-black text-white text-xs font-mono font-semibold uppercase hover:bg-zinc-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
