import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChamferCard } from '../ui/ChamferCard';
import { AnimatedCounter, EASINGS } from '../../motion';

export interface MachineStatusSegment {
  label: string;
  count: number;
  color: string;
  stateKey: string;
}

interface MachineStatusDonutCardProps {
  totalMachines?: number;
  segments?: MachineStatusSegment[];
  activeFilter?: string;
  onSelectSegment?: (stateKey: string) => void;
}

export const MachineStatusDonutCard: React.FC<MachineStatusDonutCardProps> = ({
  totalMachines = 24,
  segments = [
    { label: 'Running', count: 16, color: '#059669', stateKey: 'RUNNING' },
    { label: 'Setup', count: 3, color: '#2563EB', stateKey: 'SETUP' },
    { label: 'Idle', count: 3, color: '#D97706', stateKey: 'IDLE' },
    { label: 'Alarm', count: 1, color: '#E11D48', stateKey: 'ALARM' },
    { label: 'Stopped', count: 1, color: '#64748B', stateKey: 'STOPPED' }
  ],
  activeFilter = 'ALL',
  onSelectSegment
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const total = segments.reduce((sum, seg) => sum + seg.count, 0) || totalMachines;

  // SVG Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedOffset = 0;
  const arcs = segments.map((seg) => {
    const fraction = total > 0 ? seg.count / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += fraction * circumference;
    return {
      ...seg,
      fraction,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeSegmentObj = hoveredSegment
    ? segments.find((s) => s.stateKey === hoveredSegment)
    : activeFilter !== 'ALL'
    ? segments.find((s) => s.stateKey === activeFilter)
    : null;

  const centerCount = activeSegmentObj ? activeSegmentObj.count : totalMachines;
  const centerLabel = activeSegmentObj ? activeSegmentObj.label : 'Machines';

  return (
    <ChamferCard
      title="Machine Status"
      action={
        <span className="font-mono text-[10px] text-forge-steel tracking-widest uppercase">
          TELEMETRY • LIVE
        </span>
      }
    >
      <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Donut Chart SVG */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
            role="img"
            aria-label={`Machine status breakdown: ${segments.map(s => `${s.count} ${s.label}`).join(', ')}`}
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F4F5F7"
              strokeWidth={strokeWidth}
            />

            {/* Arc segments */}
            {arcs.map((arc) => {
              const isHovered = hoveredSegment === arc.stateKey;
              const isFiltered = activeFilter === arc.stateKey;
              return (
                <circle
                  key={arc.stateKey}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={arc.color}
                  strokeWidth={isHovered || isFiltered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(arc.stateKey)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => onSelectSegment && onSelectSegment(arc.stateKey)}
                  style={{
                    filter: isHovered || isFiltered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none'
                  }}
                />
              );
            })}
          </svg>

          {/* Centered Donut Metric with Smooth Transition */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${centerCount}-${centerLabel}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.16, ease: EASINGS.easeOut }}
                className="font-display font-bold text-3xl sm:text-4xl text-forge-black tracking-tight leading-none"
              >
                <AnimatedCounter value={centerCount} duration={0.4} />
              </motion.span>
            </AnimatePresence>
            <span className="font-sans text-xs text-forge-steel font-medium mt-1">
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend Table */}
        <div className="w-full sm:w-auto flex-1 max-w-xs space-y-2.5 font-mono">
          {segments.map((seg) => {
            const isHovered = hoveredSegment === seg.stateKey;
            const isFiltered = activeFilter === seg.stateKey;
            const pct = Math.round((seg.count / total) * 100);

            return (
              <button
                type="button"
                key={seg.stateKey}
                onClick={() => onSelectSegment && onSelectSegment(seg.stateKey)}
                onMouseEnter={() => setHoveredSegment(seg.stateKey)}
                onMouseLeave={() => setHoveredSegment(null)}
                aria-pressed={isFiltered}
                className={`w-full flex items-center justify-between p-2 text-xs border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  isFiltered
                    ? 'border-forge-orange bg-orange-50/70 shadow-sm'
                    : isHovered
                    ? 'border-forge-aluminum bg-forge-alabaster'
                    : 'border-transparent hover:bg-forge-alabaster/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: seg.color,
                      transform: isHovered || isFiltered ? 'scale(1.25)' : 'scale(1)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-forge-black font-sans text-xs sm:text-sm font-medium">
                    {seg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] text-forge-steel">
                    {pct}%
                  </span>
                  <span className="font-bold text-forge-black text-sm w-6 text-right">
                    {seg.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ChamferCard>
  );
};
