import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Globe,
  Smartphone,
  Monitor,
  FormInput,
  Package,
  Layers,
  FileSpreadsheet,
  Palette,
  TrendingUp,
  Receipt,
  StickyNote,
  Settings,
  Bell,
  ShieldCheck,
  Activity,
  ChevronRight,
  X,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { hasPermission, user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';

  const sections: NavSection[] = [
    {
      title: 'DASHBOARDS',
      items: [
        { label: 'Overview', path: '/admin', icon: LayoutDashboard },
        ...(isSuperAdmin
          ? [
              {
                label: 'Profit & Margin',
                path: '/admin/financials',
                icon: TrendingUp,
                permission: 'view_financials',
                badge: 'SUPERADMIN',
                badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
              },
            ]
          : []),
      ],
    },
    {
      title: 'REQUIREMENTS',
      items: [
        { label: 'Website Submissions', path: '/admin/submissions/website', icon: Globe, permission: 'manage_submissions' },
        { label: 'App Submissions', path: '/admin/submissions/app', icon: Smartphone, permission: 'manage_submissions' },
        { label: 'Desktop Submissions', path: '/admin/submissions/desktop', icon: Monitor, permission: 'manage_submissions' },
      ],
    },
    {
      title: 'FORM BUILDER',
      items: [
        { label: 'Dynamic Form Builder', path: '/admin/forms', icon: FormInput, permission: 'manage_forms' },
        { label: 'Internal Step Notes', path: '/admin/internal-notes', icon: StickyNote, permission: 'manage_internal_notes' },
      ],
    },
    {
      title: 'CATALOG & COMMERCIALS',
      items: [
        { label: 'Packages & Pricing', path: '/admin/packages', icon: Package, permission: 'manage_packages' },
        { label: 'Optional Services', path: '/admin/addons', icon: Layers, permission: 'manage_packages' },
        { label: 'Quotation Manager', path: '/admin/quotations', icon: FileSpreadsheet, permission: 'manage_quotations' },
        { label: 'Brand Profiles', path: '/admin/brands', icon: Palette, permission: 'manage_brands' },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'FINANCIAL MANAGEMENT',
            items: [
              { label: 'Project Cost Tracking', path: '/admin/costs', icon: Receipt, permission: 'view_financials' },
            ],
          },
        ]
      : []),
    {
      title: 'SYSTEM GOVERNANCE',
      items: [
        { label: 'Users & Access', path: '/admin/users', icon: Users, permission: 'manage_users' },
        { label: 'Settings & Terms', path: '/admin/settings', icon: Settings, permission: 'manage_settings' },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck, permission: 'manage_settings' },
        { label: 'System Health', path: '/admin/system-health', icon: Activity },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-950/75 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Full-height on mobile (z-50), docked below admin header on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] lg:w-64 lg:top-16 lg:bottom-0 lg:inset-y-auto lg:z-30 glass-panel border-r border-slate-200/80 dark:border-charcoal-750/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* User Mini Profile Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-charcoal-750/80 bg-slate-50/70 dark:bg-charcoal-900/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-glow-sm shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.fullName || 'Administrator'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
            aria-label="Close sidebar drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav List with generous bottom clearance */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 pb-20">
          {sections.map((section) => {
            const filteredItems = section.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-charcoal-600">
                  {section.title}
                </h4>

                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-glow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info & mobile quick actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-charcoal-750/80 bg-slate-50/50 dark:bg-charcoal-900/50 space-y-2">
          {/* Quick exit to public website on mobile */}
          <div className="flex items-center justify-between gap-2 lg:hidden">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-charcoal-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                onCloseMobile?.();
                await logout();
                navigate('/');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-charcoal-600 font-medium text-center">
            Digital Agency Core v1.0 • Enterprise
          </p>
        </div>
      </aside>
    </>
  );
};
