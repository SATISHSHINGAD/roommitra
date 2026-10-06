import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { ShieldCheck, UserCheck, Key, Home, Users, Utensils, LogOut } from 'lucide-react';

interface DemoAccountBarProps {
  onOpenAdmin?: () => void;
}

export const DemoAccountBar: React.FC<DemoAccountBarProps> = ({ onOpenAdmin }) => {
  const { user, demoLogin, logout, isLoading, isAdmin } = useAuth();

  // Demo shortcuts are development-only and must never appear in production.
  if (import.meta.env.VITE_DEMO_MODE !== 'true') {
    return null;
  }

  const demoRoles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: <Key className="w-3.5 h-3.5 text-purple-400" /> },
    { role: 'ADMIN', label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> },
    { role: 'PROPERTY_OWNER', label: 'Landlord', icon: <Home className="w-3.5 h-3.5 text-blue-400" /> },
    { role: 'ROOMMATE', label: 'Roommate', icon: <Users className="w-3.5 h-3.5 text-emerald-400" /> },
    { role: 'SERVICE_PROVIDER', label: 'Tiffin Chef', icon: <Utensils className="w-3.5 h-3.5 text-amber-400" /> },
    { role: 'USER', label: 'Tenant', icon: <UserCheck className="w-3.5 h-3.5 text-sky-400" /> },
  ];

  return (
    <div className="bg-slate-950/95 text-slate-300 border-b border-slate-800/80 text-xs py-1 px-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-extrabold text-amber-400 uppercase tracking-widest text-[10px]">Instant Role Tester:</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">Click to simulate any platform persona</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {demoRoles.map(item => {
            const isActive = user?.role === item.role;
            return (
              <button
                key={item.role}
                onClick={() => demoLogin(item.role)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {user && (
            <button
              onClick={logout}
              title="Sign out"
              className="ml-1.5 text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold px-1.5 py-1 rounded-md hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Open Separate Admin Portal"
              className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Admin Portal →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
