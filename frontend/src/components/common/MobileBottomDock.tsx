import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Globe,
  Sparkles,
  Layers,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface MobileBottomDockProps {
  onOpenProjectSelector: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({ onOpenProjectSelector }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Never render dock on Admin management or step-by-step intake forms
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/requirements')) {
    return null;
  }

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden max-w-sm mx-auto">
      <nav className="glass-dock p-1.5 flex items-center justify-around shadow-2xl border border-slate-200/90 dark:border-charcoal-750/90 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-2xl">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
            isCurrent('/') && !location.hash
              ? 'text-brand-500 bg-brand-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* 2. Domains */}
        <a
          href="/#domain-finder"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-all app-press cursor-pointer"
        >
          <Globe className="w-4 h-4 mb-0.5" />
          <span>Domains</span>
        </a>

        {/* 3. Center CTA: Requirement Builder */}
        <button
          type="button"
          onClick={onOpenProjectSelector}
          className="relative -top-2 flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-brand-500 text-white shadow-glow-brand app-press cursor-pointer"
          title="Start Requirement Builder"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* 4. Packages */}
        <a
          href="/#packages"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-all app-press cursor-pointer"
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Packages</span>
        </a>

        {/* 5. Portal / Account */}
        {user ? (
          <Link
            to={isAdmin ? '/admin' : '/portal'}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
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
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all app-press cursor-pointer ${
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
