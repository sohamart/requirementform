import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Globe,
  Sparkles,
  Layers,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { smoothScrollTo } from '../../utils/scroll.js';

interface MobileBottomDockProps {
  onOpenProjectSelector: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({ onOpenProjectSelector }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Never render dock on Admin management or step-by-step intake forms
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/requirements')) {
    return null;
  }

  const isCurrent = (path: string) => location.pathname === path;

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (location.pathname === '/' || location.pathname === '/domains') {
      smoothScrollTo(sectionId);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden max-w-sm mx-auto">
      <nav className="glass-dock p-1.5 flex items-center justify-around shadow-2xl border border-slate-200/90 dark:border-charcoal-750/90 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-2xl">
        {/* 1. Home */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/' && !location.hash) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
            isCurrent('/') && !location.hash
              ? 'text-brand-500 bg-brand-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* 2. Domains (Smooth Scroll) */}
        <button
          type="button"
          onClick={(e) => handleSectionClick(e, 'domain-finder')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
            location.hash === '#domain-finder' || location.pathname === '/domains'
              ? 'text-brand-500 bg-brand-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-brand-500'
          }`}
        >
          <Globe className="w-4 h-4 mb-0.5" />
          <span>Domains</span>
        </button>

        {/* 3. Center CTA: Requirement Builder with Clear Text Label */}
        <button
          type="button"
          onClick={onOpenProjectSelector}
          className="relative -top-2.5 flex flex-col items-center justify-center px-2.5 py-1.5 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-orange-500 text-white shadow-glow-brand app-press cursor-pointer border border-white/25 shrink-0"
          title="Start Requirement Builder & Estimation"
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-black tracking-tight leading-none whitespace-nowrap">
            Start Form
          </span>
        </button>

        {/* 4. Packages (Smooth Scroll) */}
        <button
          type="button"
          onClick={(e) => handleSectionClick(e, 'packages')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
            location.hash === '#packages'
              ? 'text-brand-500 bg-brand-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-brand-500'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Packages</span>
        </button>

        {/* 5. Portal / Account */}
        {user ? (
          <Link
            to={isAdmin ? '/admin' : '/portal'}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
              isCurrent('/portal') || isCurrent('/admin')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4 mb-0.5" /> : <User className="w-4 h-4 mb-0.5" />}
            <span>{isAdmin ? 'Admin' : 'Portal'}</span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
              isCurrent('/auth')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 mb-0.5" />
            <span>Login</span>
          </Link>
        )}
      </nav>
    </div>
  );
};
