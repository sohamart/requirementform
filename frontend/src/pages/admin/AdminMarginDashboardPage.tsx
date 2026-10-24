import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Globe,
  Smartphone,
  Monitor,
  Calculator,
  Wallet,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { FinancialAnalyticsDashboardDTO, ProjectFinancialsDTO } from '@shared/types/index.js';
import { formatINR, formatPercent } from '@shared/utils/currency.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminMarginDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState<FinancialAnalyticsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const canViewFinancials = isSuperAdmin || hasPermission('view_financials');

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'below_target' | 'missing_costs'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (canViewFinancials) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboard = () => {
    setLoading(true);
    adminApi
      .getFinancialDashboard()
      .then((res) => {
        if (res.data.success) {
          setData(res.data.dashboard);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load financial dashboard. Superadmin or view_financials permission required.');
      })
      .finally(() => setLoading(false));
  };

  if (!canViewFinancials) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center max-w-lg mx-auto my-12 border border-red-500/20 shadow-xl">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Access Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Profit margins, direct costs, and financial analytics are accessible exclusively by the Superadmin and Administrators who have been granted the <code>view_financials</code> permission.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        <TrendingUp className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
        <span>Calculating financial metrics and profit margins...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center max-w-lg mx-auto border border-red-500/20 shadow-xl">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Dashboard Notice</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4 leading-relaxed">{error}</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer transition-colors"
        >
          <span>Retry Loading Dashboard</span>
        </button>
      </div>
    );
  }

  // Filter projects list
  const filteredProjects = data.projects.filter((p) => {
    const matchesSearch =
      p.enquiryReference.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'below_target') return p.isBelowTargetMargin;
    if (filterType === 'missing_costs') return p.hasMissingCosts;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              STRICTLY CONFIDENTIAL • INTERNAL ONLY
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUDITED MARGINS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Profit & Margin Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time project gross profitability, direct cost breakdown, partner splits, and in-hand net margins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/admin/costs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-glow-sm transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Profit & In-Hand Calculator</span>
          </Link>

          <button
            onClick={loadDashboard}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-750 text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            Refresh Figures
          </button>
        </div>
      </div>

      {/* Target Margin & Missing Cost Alerts */}
      {(data.projectsBelowTargetMarginCount > 0 || data.projectsWithMissingCostsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.projectsBelowTargetMarginCount > 0 && (
            <div
              onClick={() => setFilterType('below_target')}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                filterType === 'below_target'
                  ? 'bg-amber-500/15 border-amber-500'
                  : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {data.projectsBelowTargetMarginCount} Project(s) Below Target Margin
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gross margin is lower than the configured target percentage. Click to filter.
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
            </div>
          )}

          {data.projectsWithMissingCostsCount > 0 && (
            <div
              onClick={() => setFilterType('missing_costs')}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                filterType === 'missing_costs'
                  ? 'bg-blue-500/15 border-blue-500'
                  : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {data.projectsWithMissingCostsCount} Project(s) Missing Cost Records
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct development expenses have not been logged yet. Click to filter.
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Grid (5 High-Level Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Approved Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Approved Revenue
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(data.totalApprovedRevenuePaise)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">
            Quoted: {formatINR(data.totalQuotedRevenuePaise)}
          </span>
        </div>

        {/* Card 2: Collected Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Collected Cash
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-500 mt-1">
            {formatINR(data.totalCollectedRevenuePaise)}
          </p>
          <span className="text-[10px] text-amber-500 font-semibold block mt-1">
            Receivables: {formatINR(data.totalOutstandingReceivablesPaise)}
          </span>
        </div>

        {/* Card 3: Actual Direct Costs */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Actual Direct Costs
          </p>
          <p className="text-xl sm:text-2xl font-black text-red-500 mt-1">
            {formatINR(data.totalActualDirectCostPaise)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">
            Estimated: {formatINR(data.totalEstimatedDirectCostPaise)}
          </span>
        </div>

        {/* Card 4: Actual Gross Profit */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Actual Gross Profit
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
            {formatINR(data.totalActualGrossProfitPaise)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
            Margin: {formatPercent(data.overallGrossMarginPercent)}
          </span>
        </div>

        {/* Card 5: Total In-Hand Profit (Superadmin Net Pocket) */}
        <div className="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl glass-card border-2 border-emerald-500/40 bg-emerald-500/5">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Total In-Hand Profit</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-500 mt-1">
            {formatINR(
              (data.projects || []).reduce(
                (sum, p) => sum + (p.inHandProfitPaise ?? p.actualGrossProfitPaise),
                0
              )
            )}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
            After Partner & Deductions
          </span>
        </div>
      </div>

      {/* Secondary Margins & Markup Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl glass-panel border border-brand-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">
              Overall Gross Margin %
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatPercent(data.overallGrossMarginPercent)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formula: (Gross Profit ÷ Revenue) × 100
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-lg shadow-glow-sm">
            %
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-charcoal-750 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">
              Overall Markup %
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatPercent(data.overallMarkupPercent)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formula: (Gross Profit ÷ Total Direct Cost) × 100
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-lg">
            ×
          </div>
        </div>
      </div>

      {/* Category-Wise Profit Margin Breakdown (Strictly Superadmin) */}
      {data.categoryBreakdown && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Category-Wise Profit Margin Breakdown (Audited)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">
              SUPERADMIN CONFIDENTIAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Website Margins Card */}
            <div className="p-5 rounded-2xl glass-card border border-brand-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Websites & Portals</h4>
                    <span className="text-[10px] text-slate-400">{data.categoryBreakdown.website.projectCount} Projects</span>
                  </div>
                </div>
                <span className="text-xs font-black text-brand-500 px-2 py-0.5 rounded-full bg-brand-500/10">
                  {formatPercent(data.categoryBreakdown.website.marginPercent)} Margin
                </span>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(data.categoryBreakdown.website.totalRevenuePaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Cost:</span>
                  <span className="font-bold text-red-500">{formatINR(data.categoryBreakdown.website.totalCostPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Profit:</span>
                  <span className="font-black text-emerald-500">{formatINR(data.categoryBreakdown.website.totalProfitPaise)}</span>
                </div>
              </div>
            </div>

            {/* Mobile App Margins Card */}
            <div className="p-5 rounded-2xl glass-card border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mobile Apps</h4>
                    <span className="text-[10px] text-slate-400">{data.categoryBreakdown.app.projectCount} Projects</span>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10">
                  {formatPercent(data.categoryBreakdown.app.marginPercent)} Margin
                </span>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(data.categoryBreakdown.app.totalRevenuePaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Cost:</span>
                  <span className="font-bold text-red-500">{formatINR(data.categoryBreakdown.app.totalCostPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Profit:</span>
                  <span className="font-black text-emerald-500">{formatINR(data.categoryBreakdown.app.totalProfitPaise)}</span>
                </div>
              </div>
            </div>

            {/* Desktop Software Margins Card */}
            <div className="p-5 rounded-2xl glass-card border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Desktop Software</h4>
                    <span className="text-[10px] text-slate-400">{data.categoryBreakdown.desktop.projectCount} Projects</span>
                  </div>
                </div>
                <span className="text-xs font-black text-purple-500 px-2 py-0.5 rounded-full bg-purple-500/10">
                  {formatPercent(data.categoryBreakdown.desktop.marginPercent)} Margin
                </span>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(data.categoryBreakdown.desktop.totalRevenuePaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Cost:</span>
                  <span className="font-bold text-red-500">{formatINR(data.categoryBreakdown.desktop.totalCostPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Profit:</span>
                  <span className="font-black text-emerald-500">{formatINR(data.categoryBreakdown.desktop.totalProfitPaise)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Financial Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
        {/* Table Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Project Margin Breakdown
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              ({filteredProjects.length} projects)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-charcoal-800 p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setFilterType('below_target')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'below_target'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Below Target
              </button>
              <button
                onClick={() => setFilterType('missing_costs')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'missing_costs'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Missing Costs
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project / client..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-xs focus:outline-none focus:border-brand-500 w-48 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No projects match the selected financial filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-900/50 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">Project Ref</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Partner Cut</th>
                  <th className="py-3 px-4 text-right">In-Hand Profit</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750 text-xs font-medium">
                {filteredProjects.map((p) => {
                  const effectiveRevenue =
                    p.customRevenuePaise && p.customRevenuePaise > 0
                      ? p.customRevenuePaise
                      : p.approvedRevenuePaise > 0
                      ? p.approvedRevenuePaise
                      : p.quotedRevenuePaise;

                  const partnerCut = p.partnerCutPaise ?? 0;
                  const inHandProfit = p.inHandProfitPaise ?? p.actualGrossProfitPaise;
                  const inHandMargin = p.inHandMarginPercent;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {p.enquiryReference}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                          {p.clientName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {p.projectCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatINR(effectiveRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-500 font-semibold font-mono">
                        {p.hasMissingCosts ? (
                          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Missing
                          </span>
                        ) : (
                          formatINR(p.actualDirectCostPaise)
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-500 font-mono">
                        {formatINR(p.actualGrossProfitPaise)}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {formatPercent(p.grossMarginPercent)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-purple-500 font-semibold font-mono">
                        {formatINR(partnerCut)}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {p.partnerSharePercent || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="font-extrabold text-emerald-500 block">
                          {formatINR(inHandProfit)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                          {formatPercent(inHandMargin)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/admin/costs?submissionId=${p.submissionId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Calculate & Costs</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
