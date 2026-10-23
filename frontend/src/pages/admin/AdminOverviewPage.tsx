import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatINR, formatPercent } from '@shared/utils/currency.js';

export const AdminOverviewPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canViewFinancials = hasPermission('view_financials');

  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [quotationsCount, setQuotationsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [financials, setFinancials] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getAllSubmissions(),
      adminApi.getAllQuotations(),
      adminApi.getAllUsers(),
      canViewFinancials ? adminApi.getFinancialDashboard() : Promise.resolve({ data: { success: false } }),
    ])
      .then(([subRes, quoteRes, userRes, finRes]) => {
        if (subRes.data.success) {
          setSubmissionsCount(subRes.data.submissions.length);
          setRecentSubmissions(subRes.data.submissions.slice(0, 5));
        }
        if (quoteRes.data.success) setQuotationsCount(quoteRes.data.quotations.length);
        if (userRes.data.success) setUsersCount(userRes.data.users.length);
        if (finRes.data.success && (finRes.data as any).dashboard) {
          setFinancials((finRes.data as any).dashboard);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [canViewFinancials]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            EXECUTIVE CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System overview of project requirement pipelines, quotations, clients, and financial margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/forms"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-charcoal-800 hover:bg-slate-800 text-white cursor-pointer"
          >
            <span>Form Builder</span>
          </Link>
          <Link
            to="/admin/quotations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
          >
            <span>Issue Quotation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Total Inquiries</span>
            <FolderKanban className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{submissionsCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Website & App Submissions</span>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Quotations</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{quotationsCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Proposals issued</span>
        </div>

        {canViewFinancials && financials ? (
          <>
            <div className="p-5 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-emerald-500">
                  Approved Revenue
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatINR(financials.totalApprovedRevenuePaise)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Quoted: {formatINR(financials.totalQuotedRevenuePaise)}
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-emerald-500">
                  Gross Margin %
                </span>
                <span className="text-xs font-bold text-emerald-500">Target 45%</span>
              </div>
              <p className="text-2xl font-black text-emerald-500">
                {formatPercent(financials.overallGrossMarginPercent)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Markup: {formatPercent(financials.overallMarkupPercent)}
              </span>
            </div>
          </>
        ) : (
          <div className="p-5 rounded-2xl glass-card col-span-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Total Registered Users</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{usersCount}</p>
              <span className="text-[10px] text-slate-500">Clients and administrators</span>
            </div>
            <Users className="w-8 h-8 text-blue-500/30" />
          </div>
        )}
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/financials"
          className="p-6 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Profit & Margin Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inspect project gross profits, labour costs, contractor allocations, and below-target margin alerts.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
            <span>Open Financials</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/forms"
          className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 hover:border-brand-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
            Dynamic Form Builder
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build custom steps, questions, options, conditional logic, and mandatory private step notes.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-500">
            <span>Manage Forms</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/quotations"
          className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
            Quotation Generator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Issue 3-page formal corporate proposal PDFs with configurable branding and milestone schedules.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-500">
            <span>Open Quotes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Submissions Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Client Requirement Submissions
          </h3>
          <Link
            to="/admin/submissions/website"
            className="text-xs font-bold text-brand-500 hover:underline"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading recent activity...</div>
        ) : recentSubmissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No submissions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-charcoal-750">
            {recentSubmissions.map((s) => (
              <div
                key={s.id}
                className="p-4 hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    {s.projectCategory === 'website' ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-brand-500">
                      {s.enquiryReference}
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.clientSnapshot.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
