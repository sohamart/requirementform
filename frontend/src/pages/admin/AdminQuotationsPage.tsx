import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  FileDown,
  Edit,
  CheckCircle,
  Eye,
  Trash2,
  Save,
  Send,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { adminApi, publicApi } from '../../services/api.js';
import {
  ClientQuotationDTO,
  QuotationLineItem,
  BrandProfileDTO,
  AdminSubmissionDTO,
} from '@shared/types/index.js';
import { formatINR, toPaise, toRupees } from '@shared/utils/currency.js';

export const AdminQuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<ClientQuotationDTO[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmissionDTO[]>([]);
  const [brands, setBrands] = useState<BrandProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal
  const [showModal, setShowModal] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Form State
  const [selectedSubId, setSelectedSubId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [packageName, setPackageName] = useState('Standard Digital Solution');
  const [scopeSummary, setScopeSummary] = useState('');
  const [discountRupees, setDiscountRupees] = useState('0');
  const [timelineDays, setTimelineDays] = useState('14');
  const [quoteStatus, setQuoteStatus] = useState<
    'draft' | 'estimate' | 'issued' | 'approved' | 'rejected'
  >('draft');

  // Line items
  const [lineItems, setLineItems] = useState<
    { id: string; title: string; quantity: number; unitPriceRupees: number }[]
  >([{ id: 'li-1', title: 'Core Digital Solution Package', quantity: 1, unitPriceRupees: 8999 }]);

  // Set of submission IDs that already have a quotation
  const quotedSubmissionIds = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => {
      if (q.submissionId) set.add(q.submissionId);
    });
    submissions.forEach((s) => {
      if (s.hasQuotation || s.status === 'quoted') {
        set.add(s.id);
      }
    });
    return set;
  }, [quotations, submissions]);

  // Unquoted requirements ready for a proposal
  const availableSubmissions = useMemo(() => {
    return submissions.filter((s) => !quotedSubmissionIds.has(s.id));
  }, [submissions, quotedSubmissionIds]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAllQuotations(),
      adminApi.getAllSubmissions(),
      adminApi.getAllBrands(),
    ])
      .then(([qRes, sRes, bRes]) => {
        if (qRes.data.success) setQuotations(qRes.data.quotations);
        if (sRes.data.success) {
          setSubmissions(sRes.data.submissions);
        }
        if (bRes.data.success) {
          setBrands(bRes.data.brands);
          const defBrand = bRes.data.brands.find((b) => b.isDefault) || bRes.data.brands[0];
          if (defBrand && !selectedBrandId) {
            setSelectedBrandId(defBrand.id || (defBrand as any)._id || '');
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenCreate = () => {
    setEditingQuoteId(null);

    // Auto-select first unquoted submission
    const firstUnquoted = submissions.find((s) => !quotedSubmissionIds.has(s.id));
    setSelectedSubId(firstUnquoted ? firstUnquoted.id : '');

    // Auto-select default brand
    const defBrand = brands.find((b) => b.isDefault) || brands[0];
    if (defBrand) {
      setSelectedBrandId(defBrand.id || (defBrand as any)._id || '');
    }

    setPackageName('Custom Digital Solution');
    setScopeSummary('Turnkey development tailored to client specifications.');
    setDiscountRupees('0');
    setTimelineDays('14');
    setQuoteStatus('draft');
    setLineItems([
      { id: `li_${Date.now()}`, title: 'Core Development Sprint', quantity: 1, unitPriceRupees: 8999 },
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (quote: ClientQuotationDTO) => {
    setEditingQuoteId(quote.id);
    setSelectedSubId(quote.submissionId);
    const matchedBrand = brands.find((b) => b.name === quote.brandSnapshot.name) || brands[0];
    if (matchedBrand) {
      setSelectedBrandId(matchedBrand.id || (matchedBrand as any)._id || '');
    }
    setPackageName(quote.packageName || '');
    setScopeSummary(quote.scopeSummary || '');
    setDiscountRupees(String(toRupees(quote.discountPaise)));
    setTimelineDays(String(quote.estimatedTimelineDays || 14));
    setQuoteStatus(quote.status as any);
    setLineItems(
      quote.lineItems.map((li) => ({
        id: li.id,
        title: li.title,
        quantity: li.quantity,
        unitPriceRupees: toRupees(li.unitPricePaise),
      }))
    );
    setShowModal(true);
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `li_${Date.now()}`, title: 'Additional Feature Module', quantity: 1, unitPriceRupees: 2000 },
    ]);
  };

  const handleRemoveLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, field: string, val: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Live total preview
  const subtotalRupees = lineItems.reduce((acc, li) => acc + li.quantity * li.unitPriceRupees, 0);
  const discountVal = parseFloat(discountRupees) || 0;
  const totalRupees = Math.max(0, subtotalRupees - discountVal);

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingQuoteId) {
      if (!selectedSubId) {
        alert('Please select an unquoted client requirement.');
        return;
      }
      if (quotedSubmissionIds.has(selectedSubId)) {
        alert('A quotation already exists for this requirement. Please select an unquoted requirement or edit the existing quotation.');
        return;
      }
    }

    if (!selectedBrandId) {
      alert('Please select a document brand identity.');
      return;
    }

    if (!packageName.trim()) {
      alert('Please enter a proposal title or package name.');
      return;
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item deliverable.');
      return;
    }

    for (let i = 0; i < lineItems.length; i++) {
      if (!lineItems[i].title.trim()) {
        alert(`Deliverable #${i + 1} requires a valid description.`);
        return;
      }
      if (lineItems[i].quantity <= 0) {
        alert(`Deliverable #${i + 1} quantity must be at least 1.`);
        return;
      }
      if (lineItems[i].unitPriceRupees < 0) {
        alert(`Deliverable #${i + 1} rate cannot be negative.`);
        return;
      }
    }

    const sanitizedLineItems: QuotationLineItem[] = lineItems.map((li) => {
      const unitPricePaise = toPaise(li.unitPriceRupees);
      return {
        id: li.id,
        title: li.title,
        quantity: li.quantity,
        unitPricePaise,
        totalPaise: li.quantity * unitPricePaise,
      };
    });

    const totalPaise = Math.max(0, toPaise(totalRupees));
    const defaultMilestones = [
      {
        title: 'Advance Mobilization & Project Initiation',
        percent: 20,
        amountPaise: Math.round(totalPaise * 0.2),
        trigger: 'Mandatory 20% advance upon contract signing & resource mobilization',
      },
      {
        title: 'UI/UX Design System & Core Architecture Preview',
        percent: 30,
        amountPaise: Math.round(totalPaise * 0.3),
        trigger: 'Upon staging presentation of interactive prototypes & database schema approval',
      },
      {
        title: 'Core Development & Functional Alpha Release',
        percent: 30,
        amountPaise: Math.round(totalPaise * 0.3),
        trigger: 'Upon functional module completion, third-party integrations & client walkthrough',
      },
      {
        title: 'Final UAT Sign-off & Production Deployment',
        percent: 20,
        amountPaise: totalPaise - Math.round(totalPaise * 0.2) - Math.round(totalPaise * 0.3) - Math.round(totalPaise * 0.3),
        trigger: 'Prior to DNS go-live, production deployment, and 100% IP/credential handover',
      },
    ];

    const payload = {
      submissionId: selectedSubId,
      brandProfileId: selectedBrandId,
      packageName,
      scopeSummary,
      lineItems: sanitizedLineItems,
      discountPaise: toPaise(discountVal),
      estimatedTimelineDays: parseInt(timelineDays, 10) || 14,
      paymentMilestones: defaultMilestones,
      status: quoteStatus,
    };

    try {
      if (editingQuoteId) {
        await adminApi.updateQuotation(editingQuoteId, payload);
      } else {
        await adminApi.createQuotation(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.details && Array.isArray(errData.details)) {
        alert('Validation Error: ' + errData.details.map((d: any) => `${d.field}: ${d.message}`).join(', '));
      } else {
        alert(errData?.error || err.message || 'Failed to save quotation.');
      }
    }
  };

  const handleDownloadPDF = async (id: string, qNum: string) => {
    try {
      const res = await adminApi.downloadQuotationPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation-${qNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download quotation PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            COMMERCIAL PROPOSALS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Quotation Proposal Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate formal 3-page proposal PDFs with configurable branding, milestones, and itemized scope.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Draft New Quotation</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center text-slate-400">
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-charcoal-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No quotations issued yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Draft New Quotation" above to link a project requirement submission to an official commercial proposal.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-900/50 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Brand Profile</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750 text-xs font-medium">
                {quotations.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-500">
                      {q.quotationNumber}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        v{q.revisionNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {q.clientSnapshot.name}
                      <span className="block text-[10px] text-brand-500 font-mono font-medium">
                        {submissions.find((s) => s.id === q.submissionId)?.enquiryReference || 'Requirement'}
                      </span>
                      {q.clientSnapshot.company && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {q.clientSnapshot.company}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300">
                        {q.brandSnapshot.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {formatINR(q.subtotalPaise)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                      {formatINR(q.totalPaise)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          q.status === 'issued'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : q.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(q.id, q.quotationNumber)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 cursor-pointer"
                          title="Download 3-Page Proposal PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Draft / Edit Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {editingQuoteId ? 'Edit Quotation Proposal' : 'Draft New Quotation Proposal'}
            </h3>

            <form onSubmit={handleSaveQuotation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Client Project Requirement *
                  </label>
                  <select
                    disabled={!!editingQuoteId}
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium focus:outline-none focus:border-brand-500"
                  >
                    {editingQuoteId ? (
                      submissions
                        .filter((s) => s.id === selectedSubId)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.enquiryReference} - {s.clientSnapshot.name} ({s.projectCategory})
                          </option>
                        ))
                    ) : (
                      <>
                        {availableSubmissions.length === 0 ? (
                          <option value="" disabled>
                            -- No Unquoted Requirements Available --
                          </option>
                        ) : (
                          <optgroup label="Ready for Quotation (Unquoted)">
                            {availableSubmissions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.enquiryReference} - {s.clientSnapshot.name} ({s.projectCategory})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {submissions.filter((s) => quotedSubmissionIds.has(s.id)).length > 0 && (
                          <optgroup label="Already Quoted (Cannot Select)">
                            {submissions
                              .filter((s) => quotedSubmissionIds.has(s.id))
                              .map((s) => (
                                <option
                                  key={s.id}
                                  value={s.id}
                                  disabled
                                  className="text-slate-400 bg-slate-100 dark:bg-charcoal-900"
                                >
                                  {s.enquiryReference} - {s.clientSnapshot.name} ({s.projectCategory}) [Quotation Exists]
                                </option>
                              ))}
                          </optgroup>
                        )}
                      </>
                    )}
                  </select>
                  {!editingQuoteId && availableSubmissions.length === 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>All client requirements already have active quotations. Edit existing proposals below.</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Document Brand Identity *
                  </label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium focus:outline-none focus:border-brand-500"
                  >
                    {brands.map((b) => {
                      const bId = b.id || (b as any)._id;
                      return (
                        <option key={bId} value={bId}>
                          {b.name} {b.isDefault ? '(Default)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proposal Title / Package Name
                  </label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g. Turnkey E-commerce Web Solution"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proposal Status
                  </label>
                  <select
                    value={quoteStatus}
                    onChange={(e) => setQuoteStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
                  >
                    <option value="draft">Draft (Internal Only)</option>
                    <option value="estimate">Preliminary Estimate</option>
                    <option value="issued">Issued to Client (Downloadable)</option>
                    <option value="approved">Approved & Signed</option>
                    <option value="rejected">Rejected / Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scope Summary
                </label>
                <textarea
                  rows={2}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  placeholder="Outline key deliverables covered by this quotation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Itemized Deliverables & Pricing
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750 grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Deliverable description"
                        value={item.title}
                        onChange={(e) => handleLineItemChange(idx, 'title', e.target.value)}
                        className="col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-medium"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                        className="col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate ₹"
                        value={item.unitPriceRupees}
                        onChange={(e) =>
                          handleLineItemChange(
                            idx,
                            'unitPriceRupees',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-bold text-brand-500 text-right"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="col-span-1 p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal & Discount Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-charcoal-850 border border-slate-200 dark:border-charcoal-750 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    ₹{subtotalRupees.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Commercial Discount / Waiver (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={discountRupees}
                    onChange={(e) => setDiscountRupees(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs text-right font-bold"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-charcoal-750 flex justify-between text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Final Total Payable:</span>
                  <span className="text-brand-500 text-base">
                    ₹{totalRupees.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Schedule Schedule Preview */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Payment Schedule (Auto-balanced)
                  </span>
                  <span className="text-[10px] text-slate-400">3 Milestones</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
                    <p className="text-[10px] text-slate-400 font-medium">1. Advance Kick-off (50%)</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{Math.round(totalRupees * 0.5).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
                    <p className="text-[10px] text-slate-400 font-medium">2. Functional Review (30%)</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{Math.round(totalRupees * 0.3).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
                    <p className="text-[10px] text-slate-400 font-medium">3. Final Delivery (20%)</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{(totalRupees - Math.round(totalRupees * 0.5) - Math.round(totalRupees * 0.3)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-charcoal-750">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingQuoteId && availableSubmissions.length === 0}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-glow-sm cursor-pointer"
                >
                  {editingQuoteId ? 'Update Quotation Proposal' : 'Save Quotation Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
