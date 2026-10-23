import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar.js';
import { Menu, Sun, Moon, ArrowLeft, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Simple breadcrumb derivation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPageTitle =
    pathParts.length > 1
      ? pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Overview';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 flex flex-col">
      {/* Admin Top Action Header */}
      <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-200/80 dark:border-charcoal-750/80 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer app-press"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/admin"
            className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm sm:text-base shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-glow-sm">
              W
            </div>
            <span className="hidden sm:inline tracking-tight">ADMIN SUITE</span>
            <span className="sm:hidden font-extrabold tracking-tight">ADMIN</span>
          </Link>

          <span className="text-slate-300 dark:text-charcoal-700 hidden sm:inline">/</span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase truncate max-w-[130px] sm:max-w-none">
            {currentPageTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer app-press border border-transparent hover:border-slate-200 dark:hover:border-charcoal-750"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Quick Return to Public Website */}
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
            title="Public Website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Public Website</span>
          </Link>

          <div className="w-px h-5 bg-slate-200 dark:bg-charcoal-750" />

          {/* User Menu with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-xs shadow-glow-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {user?.fullName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-dropdown p-2 z-50 border border-slate-200 dark:border-charcoal-750 shadow-2xl animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-charcoal-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                    {user?.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
