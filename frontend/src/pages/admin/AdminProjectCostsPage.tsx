import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Trash2,
  Wallet,
  Percent,
  Calculator,
  Edit3,
  Users,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { ProjectFinancialsDTO, CostCategory } from '@shared/types/index.js';
import { formatINR, formatPercent, toPaise, toRupees } from '@shared/utils/currency.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminProjectCostsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const submissionIdParam = searchParams.get('submissionId');

  const isSuperAdmin = user?.role === 'superadmin';
  const canViewFinancials = isSuperAdmin || hasPermission('view_financials') || hasPermission('manage_financials');
  const canManageFinancials = isSuperAdmin || hasPermission('manage_financials');

  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>(submissionIdParam || '');
  const [financials, setFinancials] = useState<ProjectFinancialsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Editable Financial Configuration State
  const [customRevenueRupees, setCustomRevenueRupees] = useState<string>('');
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [partnerSharePercent, setPartnerSharePercent] = useState<number>(0);
  const [partnerName, setPartnerName] = useState<string>('Partner');
  const [extraInHandCostRupees, setExtraInHandCostRupees] = useState<string>('0');
  const [targetMargin, setTargetMargin] = useState<string>('45');
  const [financialNotes, setFinancialNotes] = useState<string>('');

  // Inline Quick Cost Entry State
  const [newCostDescription, setNewCostDescription] = useState('');
  const [newCostCategory, setNewCostCategory] = useState<CostCategory>('infrastructure_third_party');
  const [newCostAmountRupees, setNewCostAmountRupees] = useState('');

  // Payment Record Form State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountRupees, setPaymentAmountRupees] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi' | 'card' | 'cheque'>('bank_transfer');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');

  // Load submissions list for dropdown
  useEffect(() => {
    if (!canViewFinancials) return;
    adminApi
      .getAllSubmissions()
      .then((res) => {
        if (res.data.success) {
          setSubmissionsList(res.data.submissions);
          if (!selectedSubId && res.data.submissions.length > 0) {
            setSelectedSubId(res.data.submissions[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [user]);

  // Load project financials when selectedSubId changes
  useEffect(() => {
    if (!selectedSubId) return;
    loadProjectFinancials(selectedSubId);
  }, [selectedSubId]);

  const loadProjectFinancials = (id: string) => {
    setLoading(true);
    adminApi
      .getProjectFinancials(id)
      .then((res) => {
        if (res.data.success) {
          const fin = res.data.financials;
          setFinancials(fin);

          // Populate editable state
          const rev = fin.customRevenuePaise && fin.customRevenuePaise > 0
            ? toRupees(fin.customRevenuePaise)
            : fin.approvedRevenuePaise > 0
            ? toRupees(fin.approvedRevenuePaise)
            : toRupees(fin.quotedRevenuePaise);
          setCustomRevenueRupees(String(rev));
          setPartnerSharePercent(fin.partnerSharePercent ?? 0);
          setPartnerName(fin.partnerName || 'Partner');
          setExtraInHandCostRupees(String(toRupees(fin.extraInHandCostPaise ?? 0)));
          setTargetMargin(String(fin.targetMarginPercent ?? 45));
          setFinancialNotes(fin.financialNotes || '');
        }
      })
      .catch((err) => {
        console.error(err);
        setFinancials(null);
      })
      .finally(() => setLoading(false));
  };

  // 1. Add direct cost item one by one
  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(newCostAmountRupees);
    if (isNaN(rupees) || rupees <= 0 || !newCostDescription.trim()) {
      alert('Please enter a valid cost amount and description.');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.addCostEntry({
        submissionId: selectedSubId,
        category: newCostCategory,
        isActual: true,
        amountPaise: toPaise(rupees),
        description: newCostDescription.trim(),
      });

      // Clear input fields
      setNewCostDescription('');
      setNewCostAmountRupees('');

      // Reload financials
      loadProjectFinancials(selectedSubId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add cost entry.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Delete cost entry
  const handleDeleteCost = async (costId: string) => {
    if (!confirm('Are you sure you want to remove this cost item?')) return;
    setActionLoading(true);
    try {
      await adminApi.deleteCostEntry(costId);
      loadProjectFinancials(selectedSubId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove cost item.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Save Financial, Partner & In-Hand Configuration
  const handleSaveConfig = async () => {
    const revRupees = parseFloat(customRevenueRupees);
    const partnerPercent = Number(partnerSharePercent) || 0;
    const extraCost = parseFloat(extraInHandCostRupees) || 0;
    const margin = parseFloat(targetMargin) || 45;

    setActionLoading(true);
    try {
      await adminApi.updateFinancialConfig(selectedSubId, {
        customRevenuePaise: !isNaN(revRupees) && revRupees > 0 ? toPaise(revRupees) : 0,
        partnerSharePercent: partnerPercent,
        partnerName: partnerName.trim() || 'Partner',
        extraInHandCostPaise: toPaise(extraCost),
        targetMarginPercent: margin,
        financialNotes,
      });

      setSaveSuccessMessage('Profit, Partner & In-Hand Margin settings saved successfully!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
      setIsEditingRevenue(false);
      loadProjectFinancials(selectedSubId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save configuration.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Record Payment
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(paymentAmountRupees);
    if (isNaN(rupees) || rupees <= 0 || !paymentRefNumber.trim()) {
      alert('Please enter a valid amount and transaction reference.');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.addPaymentRecord({
        submissionId: selectedSubId,
        amountPaise: toPaise(rupees),
        paymentMethod,
        status: 'received',
        referenceNumber: paymentRefNumber.trim(),
      });

      setShowPaymentModal(false);
      setPaymentAmountRupees('');
      setPaymentRefNumber('');
      loadProjectFinancials(selectedSubId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'infrastructure_third_party':
        return 'Domain, Hosting & APIs';
      case 'external_contractor':
        return 'Freelancer / Contractor';
      case 'internal_labour':
        return 'Internal Labour';
      case 'partner_allocation':
        return 'Partner Allocation';
      case 'additional_expense':
        return 'Miscellaneous & Assets';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  // Realtime Live Calculations
  const effectiveRevenuePaise = (() => {
    const customR = parseFloat(customRevenueRupees);
    if (!isNaN(customR) && customR > 0) return toPaise(customR);
    if (!financials) return 0;
    return financials.approvedRevenuePaise > 0
      ? financials.approvedRevenuePaise
      : financials.quotedRevenuePaise;
  })();

  const totalCostPaise = financials ? financials.actualDirectCostPaise : 0;
  const grossProfitPaise = Math.round(effectiveRevenuePaise - totalCostPaise);
  const grossMarginPercent =
    effectiveRevenuePaise > 0
      ? Math.round((grossProfitPaise / effectiveRevenuePaise) * 1000) / 10
      : 0;

  const partnerCutPaise =
    grossProfitPaise > 0
      ? Math.round(grossProfitPaise * ((Number(partnerSharePercent) || 0) / 100))
      : 0;

  const extraDeductionPaise = toPaise(parseFloat(extraInHandCostRupees) || 0);
  const inHandProfitPaise = grossProfitPaise - partnerCutPaise - extraDeductionPaise;
  const inHandMarginPercent =
    effectiveRevenuePaise > 0
      ? Math.round((inHandProfitPaise / effectiveRevenuePaise) * 1000) / 10
      : 0;

  if (!canViewFinancials) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center max-w-lg mx-auto my-12 border border-red-500/20 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Access Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Project direct costing records, partner splits, and internal profit margins are accessible exclusively by the Superadmin and Administrators who have been granted the <code>view_financials</code> or <code>manage_financials</code> permission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/financials"
            className="text-xs font-semibold text-slate-400 hover:text-brand-500 flex items-center gap-1 mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profit & Margin Analytics</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Profit & In-Hand Margin Calculator
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter total project price, add itemized project costs, specify partner share %, and calculate your net in-hand profit margin in real-time.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Select Active Project:
          </label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 shadow-sm"
          >
            {submissionsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.enquiryReference} — {s.clientSnapshot.name} ({s.projectCategory})
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          <Calculator className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <span>Calculating live project margins and partner splits...</span>
        </div>
      ) : !financials ? (
        <div className="p-8 rounded-2xl glass-panel text-center text-slate-400">
          No project selected or financials record not found.
        </div>
      ) : (
        <>
          {/* STEP-BY-STEP LIVE PROFIT PIPELINE BANNER */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Step 1: Project Revenue */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-blue-500/20 bg-blue-500/5 relative">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-500 tracking-wider block">
                1. Project Revenue
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(effectiveRevenuePaise)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Collected: {formatINR(financials.collectedRevenuePaise)}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingRevenue(!isEditingRevenue)}
                  className="text-blue-500 hover:text-blue-600 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingRevenue ? 'Close' : 'Edit'}</span>
                </button>
              </div>

              {isEditingRevenue && (
                <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">
                    Custom Deal Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={customRevenueRupees}
                    onChange={(e) => setCustomRevenueRupees(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Change if client negotiated or price changed.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Total Itemized Costs */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-red-500/20 bg-red-500/5">
              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-wider block">
                2. Total Costs
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-500 mt-1">
                {formatINR(totalCostPaise)}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">
                {financials.costEntries.length} Item(s) Logged
              </span>
            </div>

            {/* Step 3: Gross Margin (Project Profit) */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/5">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-500 tracking-wider block">
                3. Gross Margin
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
                {formatINR(grossProfitPaise)}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1 font-semibold">
                Margin: {formatPercent(grossMarginPercent)}
              </span>
            </div>

            {/* Step 4: Partner Share Cut */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-500 tracking-wider block">
                  4. Partner Cut ({partnerSharePercent}%)
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-purple-500 mt-1">
                {formatINR(partnerCutPaise)}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1 truncate">
                {partnerName || 'Partner Share'}
              </span>
            </div>

            {/* Step 5: IN-HAND MARGIN (Final Net Profit) */}
            <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl glass-panel border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-lg shadow-emerald-500/10">
              <span className="text-[10px] font-mono font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>5. In-Hand Margin</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">
                {formatINR(inHandProfitPaise)}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                <span>In-Hand Margin: {formatPercent(inHandMarginPercent)}</span>
              </div>
            </div>
          </div>

          {/* VISUAL PROFIT SPLIT PROGRESS BAR */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-charcoal-750">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-brand-500" />
                <span>Live Project Price Breakdown:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                100% of {formatINR(effectiveRevenuePaise)}
              </span>
            </div>

            {effectiveRevenuePaise > 0 ? (
              <div className="w-full h-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-charcoal-800 flex">
                {/* Cost % */}
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (totalCostPaise / effectiveRevenuePaise) * 100))}%` }}
                  className="bg-red-500 transition-all duration-300"
                  title={`Direct Costs: ${formatINR(totalCostPaise)}`}
                />
                {/* Partner % */}
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (partnerCutPaise / effectiveRevenuePaise) * 100))}%` }}
                  className="bg-purple-500 transition-all duration-300"
                  title={`Partner Cut: ${formatINR(partnerCutPaise)}`}
                />
                {/* Extra Deduction % */}
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (extraDeductionPaise / effectiveRevenuePaise) * 100))}%` }}
                  className="bg-slate-500 transition-all duration-300"
                  title={`Extra Overhead: ${formatINR(extraDeductionPaise)}`}
                />
                {/* In-Hand Margin % */}
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (inHandProfitPaise / effectiveRevenuePaise) * 100))}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`In-Hand Margin: ${formatINR(inHandProfitPaise)}`}
                />
              </div>
            ) : (
              <div className="w-full h-4 rounded-xl bg-slate-200 dark:bg-charcoal-800" />
            )}

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold mt-2.5">
              <span className="flex items-center gap-1 text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Total Costs: {formatINR(totalCostPaise)} ({formatPercent((totalCostPaise / (effectiveRevenuePaise || 1)) * 100)})</span>
              </span>
              <span className="flex items-center gap-1 text-purple-500">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Partner ({partnerSharePercent}%): {formatINR(partnerCutPaise)}</span>
              </span>
              {extraDeductionPaise > 0 && (
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span>Extra Cost: {formatINR(extraDeductionPaise)}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-500 font-extrabold ml-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Net In-Hand Profit: {formatINR(inHandProfitPaise)} ({formatPercent(inHandMarginPercent)})</span>
              </span>
            </div>
          </div>

          {/* MAIN 2-COLUMN SECTION: ADD COSTS (LEFT) vs PARTNER & IN-HAND CONFIG (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: ITEM-BY-ITEM DIRECT COST MANAGER (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-brand-500" />
                      <span>Itemized Project Costs</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Add third-party expenses such as domains, hosting, freelancers, themes, and external APIs here.
                    </p>
                  </div>
                  <span className="text-xs font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-xl">
                    Total Expenses: {formatINR(totalCostPaise)}
                  </span>
                </div>

                {/* Inline Fast Add Form */}
                <form
                  onSubmit={handleAddCost}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/80 dark:border-charcoal-700 space-y-3 mb-5"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    + Add New Cost Item
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        required
                        placeholder="Cost item (e.g. Domain, VPS, React Dev)"
                        value={newCostDescription}
                        onChange={(e) => setNewCostDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        step="1"
                        required
                        placeholder="Amount (₹)"
                        value={newCostAmountRupees}
                        onChange={(e) => setNewCostAmountRupees(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Cost</span>
                      </button>
                    </div>
                  </div>

                  {/* Category and Quick Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Category:</span>
                      <select
                        value={newCostCategory}
                        onChange={(e) => setNewCostCategory(e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-[11px] font-semibold"
                      >
                        <option value="infrastructure_third_party">Domain, Server & APIs</option>
                        <option value="external_contractor">Freelancer / Developer</option>
                        <option value="internal_labour">Internal Team Labour</option>
                        <option value="partner_allocation">Partner / Marketing</option>
                        <option value="additional_expense">Theme, UI & Misc</option>
                      </select>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1">
                      {['Domain (.com)', 'VPS Server', 'Dev Freelance', 'UI Theme'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setNewCostDescription(chip)}
                          className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-charcoal-750 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-brand-500/20 hover:text-brand-500 transition-colors"
                        >
                          +{chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {/* List of Added Cost Items with 1-Click Delete */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {financials.costEntries.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No cost items logged yet. Use the box above to add your first project expense!
                    </div>
                  ) : (
                    financials.costEntries.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200/80 dark:border-charcoal-750 flex items-center justify-between gap-3 group hover:border-brand-500/40 transition-colors shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                              {formatCategoryLabel(c.category)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                            {c.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-extrabold text-red-500 font-mono">
                            {formatINR(c.amountPaise)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCost(c.id)}
                            title="Delete this cost item"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PARTNER SHARE & IN-HAND MARGIN CONFIGURATION (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span>Partner Share & Margin Settings</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">
                    Split Ratio
                  </span>
                </div>

                {/* Partner Name & Percentage Input */}
                <div className="space-y-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Partner / Co-Founder Name:
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Weblets Partner / Agency Share"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Partner Share Percentage (%):</span>
                      <span className="text-purple-500 font-extrabold font-mono text-sm">
                        {partnerSharePercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={partnerSharePercent}
                      onChange={(e) => setPartnerSharePercent(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center justify-between gap-1 mt-2">
                      {[0, 10, 20, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPartnerSharePercent(pct)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            partnerSharePercent === pct
                              ? 'bg-purple-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-purple-500/10'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-purple-500/10 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Partner Cut Amount:
                      </span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 font-mono text-sm">
                        {formatINR(partnerCutPaise)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional In-Hand Deduction / Tax (Optional) */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/80 dark:border-charcoal-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Extra In-Hand Overhead / Tax ₹:
                    </label>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={extraInHandCostRupees}
                    onChange={(e) => setExtraInHandCostRupees(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400">
                    Specify any personal tax, emergency reserve, or fixed overhead deductions here.
                  </p>
                </div>

                {/* Target Gross Margin & Internal Notes */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/80 dark:border-charcoal-700">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Internal Target Margin Threshold (%):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Private Financial Commentary:
                    </label>
                    <textarea
                      rows={2}
                      value={financialNotes}
                      onChange={(e) => setFinancialNotes(e.target.value)}
                      placeholder="Add private notes on partner agreement or developer cost details..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs"
                    />
                  </div>
                </div>

                {/* Save All Configuration Button */}
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={actionLoading}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold bg-slate-900 dark:bg-charcoal-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Partner & In-Hand Configuration</span>
                </button>
              </div>
            </div>
          </div>

          {/* CLIENT PAYMENT LOGS SECTION */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Collected Client Payments ({financials.paymentRecords.length})
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-500">
                  Total Collected: {formatINR(financials.collectedRevenuePaise)}
                </span>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Client Payment</span>
                </button>
              </div>
            </div>

            {financials.paymentRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No payment receipts logged yet. Click "Record Client Payment" to track client advance or milestone settlements.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {financials.paymentRecords.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {p.paymentMethod.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: {p.referenceNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Date: {new Date(p.paymentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-sm font-extrabold text-emerald-500 font-mono">
                      {formatINR(p.amountPaise)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
              <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Record Client Payment Receipt
                </h3>

                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Amount Received (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 10000"
                      value={paymentAmountRupees}
                      onChange={(e) => setPaymentAmountRupees(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Channel
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                    >
                      <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="upi">UPI / QR Code</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="cheque">Cheque Settlement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Reference / UTR Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR-9876543210"
                      value={paymentRefNumber}
                      onChange={(e) => setPaymentRefNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-sm"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
