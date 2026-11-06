import React from 'react';

interface OeeData {
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}

interface OeeComponentBreakdownProps {
  oee: OeeData;
  targetOee?: number;
  title?: string;
  showFormula?: boolean;
  className?: string;
}

export const OeeComponentBreakdown: React.FC<OeeComponentBreakdownProps> = ({
  oee,
  targetOee = 85.0,
  title = "OVERALL EQUIPMENT EFFECTIVENESS (OEE)",
  showFormula = true,
  className = ''
}) => {
  const variance = oee.overall - targetOee;
  const isAboveOeeTarget = variance >= 0;

  const components = [
    {
      name: "AVAILABILITY",
      value: oee.availability,
      target: 90.0,
      description: "Operating Time / Planned Production Time",
      color: "bg-blue-600",
      lossCategory: "Setup & Breakdown Losses"
    },
    {
      name: "PERFORMANCE",
      value: oee.performance,
      target: 95.0,
      description: "(Total Parts × Ideal Cycle Time) / Operating Time",
      color: "bg-emerald-600",
      lossCategory: "Speed Reductions & Minor Stops"
    },
    {
      name: "QUALITY",
      value: oee.quality,
      target: 99.0,
      description: "Good Verified Parts / Total Parts Produced",
      color: "bg-teal-600",
      lossCategory: "Scrap & Rework Losses"
    }
  ];

  return (
    <div className={`border border-forge-aluminum bg-white p-3.5 sm:p-4 space-y-4 font-mono ${className}`}>
      {/* Header with Overall Score & Configured Target */}
      <div className="flex flex-wrap items-center justify-between border-b border-forge-aluminum/50 pb-3 gap-2">
        <div>
          <span className="text-[10px] text-forge-steel uppercase tracking-wider block font-semibold">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-forge-black">
              {oee.overall.toFixed(1)}%
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.2 border ${
              isAboveOeeTarget 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              {isAboveOeeTarget ? `+${variance.toFixed(1)}% vs target` : `${variance.toFixed(1)}% vs target`}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-forge-steel uppercase block">CONFIGURED TARGET</span>
          <span className="text-xs font-bold text-forge-black bg-forge-alabaster px-2 py-0.5 border border-forge-aluminum">
            {targetOee.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Triple Components Breakdown */}
      <div className="space-y-3">
        {components.map((comp) => {
          const compVariance = comp.value - comp.target;
          const isAboveTarget = compVariance >= 0;
          return (
            <div key={comp.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-forge-black text-[11px] tracking-wide">
                  {comp.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-forge-steel">
                    Target: {comp.target.toFixed(1)}%
                  </span>
                  <span className={`font-bold ${isAboveTarget ? 'text-emerald-800' : 'text-amber-900'}`}>
                    {comp.value.toFixed(1)}%
                    <span className="text-[9px] font-normal ml-1">
                      ({isAboveTarget ? `+${compVariance.toFixed(1)}%` : `${compVariance.toFixed(1)}%`})
                    </span>
                  </span>
                </div>
              </div>

              {/* Graphical Progress Bar with Target Notch */}
              <div 
                role="progressbar"
                aria-valuenow={comp.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${comp.name}: ${comp.value.toFixed(1)}%, Target: ${comp.target}%`}
                className="h-3 bg-forge-alabaster border border-forge-aluminum relative overflow-hidden flex items-center"
              >
                <div
                  className={`h-full ${comp.color} transition-all duration-300`}
                  style={{ width: `${Math.min(100, comp.value)}%` }}
                />
                {/* Target Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-forge-black z-10"
                  style={{ left: `${comp.target}%` }}
                  title={`Target: ${comp.target}%`}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-forge-steel gap-0.5">
                <span className="truncate max-w-full sm:max-w-[220px]">{comp.description}</span>
                <span className="text-[8px] uppercase">{comp.lossCategory}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showFormula && (
        <div className="p-2.5 bg-forge-alabaster border border-forge-aluminum text-[10px] text-forge-steel space-y-1">
          <div className="font-bold text-forge-black break-words">
            CALCULATION: {oee.availability.toFixed(1)}% (A) × {oee.performance.toFixed(1)}% (P) × {oee.quality.toFixed(1)}% (Q) = <span className="text-forge-black font-extrabold">{oee.overall.toFixed(1)}%</span>
          </div>
          <div className="text-[9px]">
            * Calculated according to standard OEE methodology: Availability × Performance × Quality.
          </div>
        </div>
      )}
    </div>
  );
};
