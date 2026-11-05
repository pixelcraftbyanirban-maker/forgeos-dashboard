import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ChamferCard } from '../ui/ChamferCard';

interface DataPoint {
  day: string;
  utilization: number;
}

interface WeeklyUtilizationCardProps {
  currentUtilization?: number;
  trendPct?: number;
  data?: DataPoint[];
}

export const WeeklyUtilizationCard: React.FC<WeeklyUtilizationCardProps> = ({
  currentUtilization = 78,
  trendPct = 5,
  data = [
    { day: 'Mon', utilization: 64 },
    { day: 'Tue', utilization: 72 },
    { day: 'Wed', utilization: 68 },
    { day: 'Thu', utilization: 82 },
    { day: 'Fri', utilization: 76 },
    { day: 'Sat', utilization: 84 },
    { day: 'Sun', utilization: 78 }
  ]
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // SVG Area Geometry
  const width = 260;
  const height = 90;
  const paddingX = 10;
  const paddingY = 12;

  const minVal = 50;
  const maxVal = 95;

  // Convert points to coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.utilization - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  // Build smooth cubic bezier path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <ChamferCard
      title="Utilization (This Week)"
      action={
        <span className="font-mono text-[10px] text-forge-steel tracking-widest uppercase">
          7-DAY ROLLING
        </span>
      }
    >
      <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Smooth Area Sparkline */}
        <div className="w-full sm:flex-1 relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-24 overflow-visible"
            role="img"
            aria-label={`Weekly utilization trend: ${data.map(d => `${d.day}: ${d.utilization}%`).join(', ')}`}
          >
            <defs>
              <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F25C19" stopOpacity="0.35" />
                <stop offset="90%" stopColor="#F25C19" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaPath} fill="url(#utilizationGradient)" />

            {/* Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#F25C19"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Interactive Data Dots */}
            {points.map((pt) => {
              const isHovered = hoveredPoint?.day === pt.day;
              return (
                <g key={pt.day}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? '#0A0D12' : '#F25C19'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip if hovered */}
          {hoveredPoint && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-forge-black text-white px-2 py-0.5 text-[10px] font-mono shadow-sm pointer-events-none select-none">
              {hoveredPoint.day}: <strong className="text-forge-orange">{hoveredPoint.utilization}%</strong>
            </div>
          )}

          {/* Days Baseline */}
          <div className="flex justify-between px-2 pt-1 font-mono text-[9px] text-forge-steel select-none">
            {data.map((d) => (
              <span key={d.day}>{d.day}</span>
            ))}
          </div>
        </div>

        {/* Right: Bold Metric & Trend Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 sm:border-l border-forge-aluminum/60 pt-3 sm:pt-0 sm:pl-5 flex-shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-mono text-forge-steel uppercase font-semibold">
              AVERAGE OEE
            </div>
            <div className="font-display font-bold text-3xl sm:text-4xl text-forge-black tracking-tight leading-none mt-1">
              {currentUtilization}%
            </div>
          </div>

          <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+{trendPct}%</span>
          </div>
        </div>
      </div>
    </ChamferCard>
  );
};
