import React from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Cpu, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Radio, 
  ChevronRight,
  X 
} from 'lucide-react';
import { Logo } from '../ui/Logo';

export type NavTab = 'overview' | 'production' | 'machines' | 'exceptions' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  exceptionsCount: number;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  exceptionsCount,
  isMobile = false,
  onCloseMobile
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'production', label: 'Production', icon: Workflow },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const handleTabClick = (tabId: NavTab) => {
    onTabChange(tabId);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside 
      aria-label="Application navigation"
      className={`w-64 bg-forge-black text-white flex flex-col justify-between border-r border-forge-steel/30 select-none flex-shrink-0 min-h-screen ${
        isMobile ? 'h-full max-w-[85vw]' : ''
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-forge-steel/30 flex items-center justify-between">
          <Logo variant="full" theme="dark" height={26} />
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-1.5 py-0.5 border border-forge-steel/50 text-zinc-300 tracking-widest uppercase">
              MES v1.0
            </span>
            {isMobile && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation sidebar"
                className="p-1.5 text-zinc-400 hover:text-white border border-zinc-700 bg-zinc-900 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Operational Context Subheader */}
        <div className="px-5 py-3 border-b border-forge-steel/20 bg-black/40">
          <div className="flex items-center gap-1.5 text-forge-aluminum">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-zinc-200">
              SHREE GANESH PRECISION • HOWRAH
            </span>
          </div>
          <div className="text-[9px] font-mono text-zinc-300 pt-0.5">
            24-SPINDLE HMLV FACILITY • WB, INDIA
          </div>
        </div>

        {/* Navigation Section */}
        <nav aria-label="Main Navigation" className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono tracking-wider transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-forge-orange'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forge-orange' : 'text-zinc-400'}`} aria-hidden="true" />
                  <span className="uppercase text-[11px]">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.id === 'exceptions' && exceptionsCount > 0 && (
                    <span 
                      aria-label={`${exceptionsCount} active exceptions`}
                      className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-rose-600 text-white rounded-none border border-rose-400/50"
                    >
                      {exceptionsCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-forge-orange" aria-hidden="true" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Status & Settings */}
      <div className="border-t border-forge-steel/30 bg-black/60 p-4 space-y-3">
        {/* System Online Badge */}
        <div className="p-2.5 bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-wider text-emerald-400 font-semibold uppercase">
                SYSTEM: ONLINE
              </span>
            </div>
            <span className="font-mono text-[9px] text-zinc-400">
              5s POLLING
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-zinc-300 flex justify-between">
            <span>MTConnect Bridge</span>
            <span className="text-zinc-200">24/24 Spindles</span>
          </div>
        </div>

        {/* User Context */}
        <div className="px-2.5 py-2 bg-zinc-900/60 border border-zinc-800/80 font-mono text-[10px]">
          <div className="text-zinc-400">LOGGED IN:</div>
          <div className="text-zinc-100 font-bold truncate">Arindam Chatterjee</div>
          <div className="text-forge-orange text-[9px]">PRODUCTION MANAGER</div>
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => alert("Settings configuration panel")}
          aria-label="Open shop settings configuration"
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="uppercase">Shop Settings</span>
        </button>
      </div>
    </aside>
  );
};
