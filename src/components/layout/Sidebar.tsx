import React from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Cpu, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Radio, 
  ChevronRight 
} from 'lucide-react';
import { Logo } from '../ui/Logo';

export type NavTab = 'overview' | 'production' | 'machines' | 'exceptions' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  exceptionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  exceptionsCount
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'production', label: 'Production', icon: Workflow },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 bg-forge-black text-white flex flex-col justify-between border-r border-forge-steel/30 select-none flex-shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-forge-steel/30 flex items-center justify-between">
          <Logo variant="full" theme="dark" height={28} />
          <span className="font-mono text-[9px] px-1.5 py-0.5 border border-forge-steel/50 text-forge-steel tracking-widest uppercase">
            MES v1.0
          </span>
        </div>

        {/* Operational Context Subheader */}
        <div className="px-5 py-3 border-b border-forge-steel/20 bg-black/40">
          <div className="flex items-center gap-1.5 text-forge-aluminum">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">
              PLANT 01 • SPINDLE NETWORK
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono tracking-wider transition-colors relative ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-forge-orange'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forge-orange' : 'text-zinc-400'}`} />
                  <span className="uppercase text-[11px]">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.id === 'exceptions' && exceptionsCount > 0 && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-rose-600/90 text-white rounded-none border border-rose-400/50">
                      {exceptionsCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-forge-orange" />}
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-mono text-[10px] tracking-wider text-emerald-400 font-semibold uppercase">
                SYSTEM: ONLINE
              </span>
            </div>
            <span className="font-mono text-[9px] text-zinc-500">
              5s POLLING
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-zinc-400 flex justify-between">
            <span>MTConnect Bridge</span>
            <span className="text-zinc-300">12/12 Spindles</span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => alert("Settings configuration panel")}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 font-mono text-[11px] transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="uppercase">Shop Settings</span>
        </button>
      </div>
    </aside>
  );
};
