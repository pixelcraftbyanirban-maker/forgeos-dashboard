import React from 'react';

interface OeeData {
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}

interface OeeComponentBreakdownProps {
  oee: OeeData;
  title?: string;
  showFormula?: boolean;
  className?: string;
}

export const OeeComponentBreakdown: React.FC<OeeComponentBreakdownProps> = ({
  oee,
  title = "GROUNDED OEE BREAKDOWN",
  showFormula = true,
  className = ''
}) => {
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
      description: "Total Parts × Ideal Cycle Time / Operating Time",
      color: "bg-emerald-600",
      lossCategory: "Speed Reductions & Minor Stops"
    },
    {
      name: "QUALITY",
      value: oee.quality,
      target: 99.0,
      description: "Good Verified Parts / Total Parts Produced",
      color: "bg-forge-orange",
      lossCategory: "Scrap & Rework Losses"
    }
  ];

  return (
    <div className={`border border-forge-aluminum bg-white p-3.5 sm:p-4 space-y-4 font-mono ${className}`}>
      {/* Header with Overall Score */}
      <div className="flex flex-wrap items-center justify-between border-b border-forge-aluminum/50 pb-3 gap-2">
        <div>
          <span className="text-[10px] text-forge-steel uppercase tracking-wider block">
            {title}
          </span>
          <span className="font-display font-bold text-2xl text-forge-black">
            {oee.overall.toFixed(1)}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-forge-steel uppercase block">WORLD CLASS BENCHMARK</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
            ≥ 85.0%
          </span>
        </div>
      </div>

      {/* Triple Components Breakdown */}
      <div className="space-y-3">
        {components.map((comp) => {
          const isAboveTarget = comp.value >= comp.target;
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
                  style={{ width: `${comp.value}%` }}
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
            OEE FORMULA: {oee.availability.toFixed(1)}% (A) × {oee.performance.toFixed(1)}% (P) × {oee.quality.toFixed(1)}% (Q) = <span className="text-forge-orange font-extrabold">{oee.overall.toFixed(1)}%</span>
          </div>
          <div className="text-[9px]">
            * Calculated according to SEMI E10 & ISO 22400 shop-floor execution standards.
          </div>
        </div>
      )}
    </div>
  );
};
