import React from 'react';
import { ChamferCard } from '../components/ui/ChamferCard';
import { NavTab } from '../components/layout/Sidebar';
import { Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  tab: NavTab;
  onBackToOverview: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ tab, onBackToOverview }) => {
  const titles: Record<NavTab, { title: string; phase: string; desc: string }> = {
    overview: { title: 'Overview', phase: 'PHASE 02', desc: 'Current active module.' },
    production: { title: 'Production Management', phase: 'PHASE 03', desc: 'Detailed job progress, operation-level routing, plan-vs-actual tracking, and part dispatching.' },
    machines: { title: 'Machine Spindle Telemetry', phase: 'PHASE 04', desc: 'Deep spindle diagnostics, historical OEE trends, sensor feeds, tool life tracking, and maintenance logs.' },
    exceptions: { title: 'Production Exceptions & Deviations', phase: 'PHASE 05', desc: 'Deviation event history, root cause investigation workflows, and manager sign-offs.' },
    reports: { title: 'Historical & Analytics Reports', phase: 'REPORTS', desc: 'Audit compliance, shift-over-shift OEE comparison, and job profitability analytics.' },
  };

  const info = titles[tab];

  return (
    <ChamferCard title={info.title} tag={info.phase}>
      <div className="py-12 px-4 sm:px-6 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-forge-alabaster border border-forge-aluminum flex items-center justify-center mx-auto text-forge-orange">
          <Construction className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-950 font-bold uppercase inline-block">
            PLANNED FOR {info.phase}
          </span>
          <h3 className="font-display font-bold text-xl text-forge-black">
            {info.title}
          </h3>
          <p className="text-xs text-forge-steel font-sans leading-relaxed">
            {info.desc}
          </p>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={onBackToOverview}
            className="px-4 py-2 bg-forge-black text-white hover:bg-zinc-800 text-xs font-mono font-semibold uppercase flex items-center gap-2 mx-auto transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-forge-orange" aria-hidden="true" />
            RETURN TO FACTORY OVERVIEW
          </button>
        </div>
      </div>
    </ChamferCard>
  );
};
