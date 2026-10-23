import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Sun,
  Moon,
  User,
  LogOut,
  FolderKanban,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Globe,
  Layers,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { publicApi } from '../../services/api.js';

interface NavbarProps {
  onOpenProjectSelector: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProjectSelector, onOpenSearch }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [brandName, setBrandName] = useState<string>(() => {
    return localStorage.getItem('weblets_brand_name') || 'WEBLETS';
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchBrand = () => {
      publicApi
        .getBrands()
        .then((res) => {
          if (res.data.success && res.data.brands.length > 0) {
            const defaultBrand = res.data.brands.find((b) => b.isDefault) || res.data.brands[0];
            const resolved = defaultBrand.name || defaultBrand.logoText || 'WEBLETS';
            setBrandName(resolved);
            localStorage.setItem('weblets_brand_name', resolved);
          }
        })
        .catch(() => {});
    };

    fetchBrand();

    // Listen to custom event when brand is updated in Admin
    const onBrandUpdate = (e: any) => {
      if (e?.detail) {
        setBrandName(e.detail);
      } else {
        fetchBrand();
      }
    };

    window.addEventListener('brand_updated', onBrandUpdate);
    return () => window.removeEventListener('brand_updated', onBrandUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const isCurrent = (path: string) => location.pathname === path && !location.hash;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 px-3 sm:px-6 lg:px-8 py-2.5">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-200 ${
          scrolled
            ? 'glass-header-pill shadow-lg dark:shadow-2xl py-2 px-3 sm:px-5'
            : 'bg-white/85 dark:bg-charcoal-900/85 backdrop-blur-xl border border-slate-200/70 dark:border-charcoal-750/70 shadow-sm py-2 px-3 sm:px-5'
        } flex items-center justify-between gap-2 sm:gap-4`}
      >
        {/* Left: Clean Brand Identity (Truncates smoothly so it never overflows) */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer app-press select-none min-w-0 shrink"
          title={brandName}
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-glow-sm group-hover:scale-105 transition-transform shrink-0">
            <span>{brandName.charAt(0).toUpperCase() || 'W'}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-charcoal-900" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white leading-none truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[170px] md:max-w-[150px] lg:max-w-[200px] xl:max-w-[280px]">
              {brandName}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
              PRO
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar with Single-Line Items */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-slate-100/70 dark:bg-charcoal-950/70 p-1 rounded-xl border border-slate-200/60 dark:border-charcoal-750/60 shrink-0">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isCurrent('/')
                ? 'bg-white dark:bg-charcoal-800 text-brand-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-charcoal-850/50'
            }`}
          >
            Home
          </Link>

          <a
            href="/#domain-finder"
            className="px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-charcoal-850/50 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Domain AI</span>
          </a>

          <a
            href="/#packages"
            className="px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-charcoal-850/50 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Packages</span>
          </a>

          <a
            href="/#services"
            className="px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-charcoal-850/50 transition-all whitespace-nowrap cursor-pointer"
          >
            Addons
          </a>

          {user && (
            <Link
              to="/portal"
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                location.pathname.startsWith('/portal')
                  ? 'bg-white dark:bg-charcoal-800 text-brand-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-charcoal-850/50'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 shrink-0" />
              <span>Portal</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-500 text-charcoal-950 font-bold shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right: Actions, Theme & User Management */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Universal Search Button */}
          <button
            type="button"
            onClick={onOpenSearch || onOpenProjectSelector}
            title="Universal Search (Ctrl+K)"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer app-press border border-transparent hover:border-slate-200 dark:hover:border-charcoal-750"
          >
            <Search className="w-4 h-4 text-brand-500" />
            <span className="hidden md:inline text-xs font-medium text-slate-500 dark:text-slate-400">
              Search
            </span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-200/60 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-charcoal-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer app-press border border-transparent hover:border-slate-200 dark:hover:border-charcoal-750"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Primary CTA: Launch Requirement Builder (Guaranteed Single Line) */}
          <button
            onClick={onOpenProjectSelector}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-sm hover:shadow-glow-brand transition-all cursor-pointer app-press whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Start Project</span>
          </button>

          {/* User Account State (Clean, Compact Avatar Pill) */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/90 dark:border-charcoal-750/90 bg-slate-50 dark:bg-charcoal-850 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-all cursor-pointer app-press shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm shrink-0">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[85px] truncate whitespace-nowrap leading-tight">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] uppercase font-mono font-semibold text-slate-400 leading-tight">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl glass-dropdown p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-charcoal-750">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-charcoal-750 mb-1.5 bg-slate-50/70 dark:bg-charcoal-950/70 rounded-xl">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {user.role}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/portal"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-charcoal-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-brand-500" />
                    <span>My Requirement Projects</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xl cursor-pointer transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Admin Management Suite</span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-slate-100 dark:border-charcoal-800" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200/90 dark:border-charcoal-750/90 bg-white/50 dark:bg-charcoal-850/50 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer app-press shadow-sm whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer app-press"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brand-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide-Down Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-slate-200/90 dark:border-charcoal-750/90 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-2xl p-4 shadow-2xl animate-in slide-in-from-top-3 duration-200 space-y-3">
          {/* Quick Search in Mobile Drawer */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenSearch) onOpenSearch();
              else onOpenProjectSelector();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-charcoal-700 app-press cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Search packages, domains & charges...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-charcoal-900 text-[10px] font-mono border border-slate-200 dark:border-charcoal-750 text-slate-500 shrink-0">
              Find
            </kbd>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-charcoal-850/70 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
            >
              <span>Home Hub</span>
            </Link>

            <a
              href="/#domain-finder"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-charcoal-850/70 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-500" />
              <span>Domain AI</span>
            </a>

            <a
              href="/#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-charcoal-850/70 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
            >
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Packages</span>
            </a>

            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-charcoal-850/70 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Addons</span>
            </a>
          </div>

          {user && (
            <Link
              to="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
            >
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                <span>My Project Portal</span>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Management Suite</span>
              </div>
            </Link>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenProjectSelector();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-glow-sm app-press cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Requirement Form</span>
          </button>
        </div>
      )}
    </header>
  );
};
