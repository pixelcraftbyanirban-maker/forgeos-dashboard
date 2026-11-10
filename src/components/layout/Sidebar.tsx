import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Cpu, 
  BarChart3, 
  ClipboardList,
  ShieldCheck,
  Boxes,
  Radio,
  Settings,
  ChevronRight,
  Terminal,
  User,
  LogOut,
  X 
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { UserRole } from '../../types';
import { SidebarActiveIndicator } from '../../motion';

export type NavTab = 
  | 'overview' 
  | 'orders' 
  | 'production' 
  | 'machines' 
  | 'quality' 
  | 'inventory' 
  | 'exceptions' 
  | 'reports' 
  | 'operator';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  exceptionsCount: number;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSignOut?: () => void;
}

export const ROLE_PERSONNEL: Record<UserRole, { name: string; title: string }> = {
  PRODUCTION_MANAGER: { name: 'Arindam Chatterjee', title: 'PRODUCTION MANAGER' },
  SHOP_SUPERVISOR: { name: 'Sourav Das', title: 'SHOP SUPERVISOR' },
  MACHINE_OPERATOR: { name: 'Rahul Das', title: 'CNC OPERATOR (VMC-01)' },
  QUALITY_MANAGER: { name: 'Priya Sharma', title: 'QUALITY LEAD (QC)' },
  INVENTORY_MANAGER: { name: 'Alok Mukherjee', title: 'STORES & TOOLING' },
  SYSTEM_ADMIN: { name: 'IT Infrastructure', title: 'SYSTEM ADMINISTRATOR' }
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  exceptionsCount,
  isMobile = false,
  onCloseMobile,
  currentRole = 'PRODUCTION_MANAGER',
  onRoleChange,
  onSignOut
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(currentRole);

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'production', label: 'Production', icon: Workflow },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'quality', label: 'Quality', icon: ShieldCheck, badge: exceptionsCount },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'operator', label: 'Operator Console', icon: Terminal }
  ];

  const handleTabClick = (tabId: NavTab) => {
    onTabChange(tabId);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    if (onRoleChange) onRoleChange(role);
    if (role === 'MACHINE_OPERATOR') {
      onTabChange('operator');
    }
  };

  const user = ROLE_PERSONNEL[activeRole];

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
                className={`group w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono tracking-wider transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {isActive && (
                  <SidebarActiveIndicator
                    layoutId={isMobile ? 'mobileSidebarActiveTab' : 'desktopSidebarActiveTab'}
                    className="absolute inset-0 bg-forge-orange shadow-md -z-0"
                  />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="uppercase text-[11px]">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 relative z-10">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span 
                      aria-label={`${item.badge} active exceptions`}
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.2 transition-colors ${
                        isActive ? 'bg-white text-forge-orange' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white animate-in fade-in duration-150" aria-hidden="true" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Status, Role Selector & Settings */}
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

        {/* Role-Based Access Prototype Selector (Phase 11) */}
        <div className="px-2.5 py-2 bg-zinc-900/60 border border-zinc-800/80 font-mono text-[10px] space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span>USER CONTEXT / ROLE:</span>
            <User className="w-3 h-3 text-forge-steel" aria-hidden="true" />
          </div>
          <select
            value={activeRole}
            onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
            aria-label="Switch active user role"
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] font-mono p-1 focus:outline-none focus:border-forge-orange"
          >
            <option value="PRODUCTION_MANAGER">Production Manager</option>
            <option value="SHOP_SUPERVISOR">Shop Supervisor</option>
            <option value="MACHINE_OPERATOR">Machine Operator (Terminal)</option>
            <option value="QUALITY_MANAGER">Quality Manager (QA)</option>
            <option value="INVENTORY_MANAGER">Inventory & Tooling Lead</option>
            <option value="SYSTEM_ADMIN">System Administrator</option>
          </select>
          <div className="text-zinc-300 font-bold truncate pt-0.5">{user.name}</div>
          <div className="text-forge-orange text-[9px] truncate">{user.title}</div>
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => alert("Shop Settings & Machine Connectivity: Configured for Howrah 24-Spindle Facility via MTConnect Adapter.")}
          aria-label="Open shop settings configuration"
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="uppercase">Shop Settings</span>
        </button>

        {/* Lock Terminal / Sign Out */}
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Lock terminal and sign out to 3D entrance"
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-forge-orange hover:text-white hover:bg-forge-orange/20 border border-forge-orange/30 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-orange"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="uppercase">LOCK TERMINAL // GATEWAY</span>
          </button>
        )}
      </div>
    </aside>
  );
};
