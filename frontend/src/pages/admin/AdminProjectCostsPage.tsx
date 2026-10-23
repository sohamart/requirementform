import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { ProjectFinancialsDTO, CostCategory } from '@shared/types/index.js';
import { formatINR, formatPercent, toPaise, toRupees } from '@shared/utils/currency.js';

export const AdminProjectCostsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const submissionIdParam = searchParams.get('submissionId');

  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>(submissionIdParam || '');
  const [financials, setFinancials] = useState<ProjectFinancialsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Cost Entry Form State
  const [showCostModal, setShowCostModal] = useState(false);
  const [costCategory, setCostCategory] = useState<CostCategory>('internal_labour');
  const [costAmountRupees, setCostAmountRupees] = useState('');
  const [costDescription, setCostDescription] = useState('');
  const [isActualCost, setIsActualCost] = useState(true);

  // New Payment Record Form State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountRupees, setPaymentAmountRupees] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi' | 'card' | 'cheque'>('bank_transfer');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');

  // Target Margin Form
  const [targetMargin, setTargetMargin] = useState('45');
  const [financialNotes, setFinancialNotes] = useState('');

  // Load submissions list for dropdown
  useEffect(() => {
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
  }, []);

  // Load project financials when selectedSubId changes
  useEffect(() => {
    if (!selectedSubId) return;
    setLoading(true);
    adminApi
      .getProjectFinancials(selectedSubId)
      .then((res) => {
        if (res.data.success) {
          setFinancials(res.data.financials);
          setTargetMargin(String(res.data.financials.targetMarginPercent));
          setFinancialNotes(res.data.financials.financialNotes || '');
        }
      })
      .catch((err) => {
        console.error(err);
        setFinancials(null);
      })
      .finally(() => setLoading(false));
  }, [selectedSubId]);

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(costAmountRupees);
    if (isNaN(rupees) || rupees <= 0 || !costDescription.trim()) {
      alert('Please enter a valid amount and description.');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.addCostEntry({
        submissionId: selectedSubId,
        category: costCategory,
        isActual: isActualCost,
        amountPaise: toPaise(rupees),
        description: costDescription.trim(),
      });

      // Reload project financials
      const res = await adminApi.getProjectFinancials(selectedSubId);
      if (res.data.success) setFinancials(res.data.financials);

      setShowCostModal(false);
      setCostAmountRupees('');
      setCostDescription('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add cost entry.');
    } finally {
      setActionLoading(false);
    }
  };

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

      const res = await adminApi.getProjectFinancials(selectedSubId);
      if (res.data.success) setFinancials(res.data.financials);

      setShowPaymentModal(false);
      setPaymentAmountRupees('');
      setPaymentRefNumber('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTargetMargin = async () => {
    const margin = parseFloat(targetMargin);
    if (isNaN(margin) || margin < 0 || margin > 100) {
      alert('Target margin must be between 0% and 100%.');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.updateTargetMargin(selectedSubId, {
        targetMarginPercent: margin,
        financialNotes,
      });

      const res = await adminApi.getProjectFinancials(selectedSubId);
      if (res.data.success) setFinancials(res.data.financials);
      alert('Target margin and internal notes updated.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update target margin.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'internal_labour':
        return 'Internal Labour';
      case 'external_contractor':
        return 'External Contractor';
      case 'infrastructure_third_party':
        return 'Infrastructure & APIs';
      case 'partner_allocation':
        return 'Partner Allocation';
      case 'additional_expense':
        return 'Additional Expenses';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/financials"
            className="text-xs font-semibold text-slate-400 hover:text-brand-500 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profit & Margin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Project Direct Cost & Margin Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure direct labour, contractor disbursements, infrastructure expenses, and collected payments.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Select Active Project:
          </label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
          >
            {submissionsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.enquiryReference} - {s.clientSnapshot.name} ({s.projectCategory})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading project cost entries...
        </div>
      ) : !financials ? (
        <div className="p-8 rounded-2xl glass-panel text-center text-slate-400">
          No project selected or financials record not found.
        </div>
      ) : (
        <>
          {/* Project Summary Banner */}
          <div className="p-6 rounded-3xl glass-panel border border-brand-500/20 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">Project Reference</p>
              <p className="text-lg font-black text-brand-500 font-mono mt-0.5">
                {financials.enquiryReference}
              </p>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                {financials.clientName}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">Project Revenue</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatINR(
                  financials.approvedRevenuePaise > 0
                    ? financials.approvedRevenuePaise
                    : financials.quotedRevenuePaise
                )}
              </p>
              <span className="text-[10px] text-emerald-500 font-semibold">
                Collected: {formatINR(financials.collectedRevenuePaise)}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">Total Direct Cost</p>
              <p className="text-lg font-black text-red-500 mt-0.5">
                {formatINR(financials.actualDirectCostPaise)}
              </p>
              <span className="text-[10px] text-slate-400">
                Est: {formatINR(financials.estimatedDirectCostPaise)}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">Gross Margin %</p>
              <p
                className={`text-lg font-black mt-0.5 ${
                  financials.isBelowTargetMargin ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {formatPercent(financials.grossMarginPercent)}
              </p>
              <span className="text-[10px] text-slate-400">
                Target: {financials.targetMarginPercent}%
              </span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCostModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Direct Cost Entry</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Client Payment</span>
            </button>
          </div>

          {/* Two-Column Grid: Cost Entries & Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Direct Cost Entries Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-500" />
                  <span>Direct Cost Entries ({financials.costEntries.length})</span>
                </h3>
                <span className="text-xs font-extrabold text-red-500">
                  Total: {formatINR(financials.actualDirectCostPaise)}
                </span>
              </div>

              {financials.costEntries.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No direct costs logged yet. Click "Log Direct Cost Entry" above to add labour or contractor fees.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {financials.costEntries.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                            {formatCategoryLabel(c.category)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {c.description}
                        </p>
                        <p className="text-[10px] text-slate-400">Logged by: {c.loggedByName}</p>
                      </div>

                      <span className="text-sm font-extrabold text-red-500">
                        {formatINR(c.amountPaise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collected Client Payments Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Collected Payments ({financials.paymentRecords.length})</span>
                </h3>
                <span className="text-xs font-extrabold text-emerald-500">
                  Total: {formatINR(financials.collectedRevenuePaise)}
                </span>
              </div>

              {financials.paymentRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No payment records logged yet. Click "Record Client Payment" to track client advance or milestone settlements.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
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

                      <span className="text-sm font-extrabold text-emerald-500">
                        {formatINR(p.amountPaise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target Margin & Financial Notes Section */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-charcoal-750">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Project Target Margin & Private Financial Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Gross Margin Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm font-bold focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Projects below this threshold will be flagged on the financial dashboard.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Internal Financial Commentary (Private)
                </label>
                <textarea
                  rows={2}
                  value={financialNotes}
                  onChange={(e) => setFinancialNotes(e.target.value)}
                  placeholder="Record internal cost rationale, contractor arrangements, or partner splits..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-charcoal-750 flex justify-end">
              <button
                onClick={handleSaveTargetMargin}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-charcoal-800 hover:bg-brand-500 dark:hover:bg-brand-500 text-white transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Financial Configuration</span>
              </button>
            </div>
          </div>

          {/* Add Cost Entry Modal */}
          {showCostModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
              <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Log Project Direct Cost
                </h3>

                <form onSubmit={handleAddCost} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Category
                    </label>
                    <select
                      value={costCategory}
                      onChange={(e) => setCostCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                    >
                      <option value="internal_labour">Internal Labour & Sprint Hours</option>
                      <option value="external_contractor">External Contractor / Freelancer</option>
                      <option value="infrastructure_third_party">Infrastructure, Hosting & APIs</option>
                      <option value="partner_allocation">Partner Allocation / Commission</option>
                      <option value="additional_expense">Additional Project Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Amount in INR (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 5000"
                      value={costAmountRupees}
                      onChange={(e) => setCostAmountRupees(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description / Item Details
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend React developer sprint 2"
                      value={costDescription}
                      onChange={(e) => setCostDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActual"
                      checked={isActualCost}
                      onChange={(e) => setIsActualCost(e.target.checked)}
                      className="rounded text-brand-500"
                    />
                    <label htmlFor="isActual" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Recorded as Actual Direct Cost (Affects Real Margin)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCostModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-sm"
                    >
                      Save Cost Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Record Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
              <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Record Client Invoice Payment
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
                      Transaction Reference / UTR
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
