import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import clsx from 'clsx';

import authService from '../services/authService';

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'Admin';

  const visibleNavItems = isAdmin
    ? [
        { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/organization', label: 'Organization Setup', icon: Building2 },
      ]
    : [
        { to: '/employee-dashboard', label: 'My Profile', icon: LayoutDashboard }, // using LayoutDashboard or User
        { to: '/organization', label: 'My Department', icon: Building2 },
      ];
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-bg-surface transition-all duration-200 ease-out',
          collapsed ? 'w-20' : 'w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-blue-700 text-sm font-bold text-white shadow-glow">
            AF
          </div>
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight text-text">
              AssetFlow
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
                  )}
                  <Icon size={18} className="shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
