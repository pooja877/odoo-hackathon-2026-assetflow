import { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function Navbar({ onMenuClick, sidebarCollapsed }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { name: 'Aditi Rao', role: 'Admin' };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search assets, employees, bookings..."
            className="w-64 rounded-lg border border-border bg-bg-card py-2 pl-9 pr-3 text-sm text-text placeholder:text-gray-500 transition-all focus:w-80 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 lg:w-72"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text">
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-bg-surface" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-white/5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-blue-700 text-xs font-semibold text-white">
              {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-text">{user.name}</p>
              <p className="text-xs leading-tight text-text-secondary">{user.role}</p>
            </div>
            <ChevronDown size={14} className="hidden text-text-secondary sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 animate-slideUp rounded-xl border border-border bg-bg-card p-1.5 shadow-popover">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text">
                  <User size={15} /> Profile
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text">
                  <Settings size={15} /> Settings
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
