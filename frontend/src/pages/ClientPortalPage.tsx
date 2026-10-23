import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileDown,
  Globe,
  Smartphone,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { clientApi } from '../services/api.js';
import { ClientSubmissionDTO, ClientQuotationDTO } from '@shared/types/index.js';
import { formatINR } from '@shared/utils/currency.js';
import { useAuth } from '../context/AuthContext.js';

interface ClientPortalPageProps {
  onOpenProjectSelector: () => void;
}

export const ClientPortalPage: React.FC<ClientPortalPageProps> = ({ onOpenProjectSelector }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ClientSubmissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalSub, setActiveModalSub] = useState<ClientSubmissionDTO | null>(null);
  const [activeQuotation, setActiveQuotation] = useState<ClientQuotationDTO | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    clientApi
      .getMySubmissions()
      .then((res) => {
        if (res.data.success) {
          setSubmissions(res.data.submissions);
        }
      })
      .catch((err) => console.error('Failed to load user submissions:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadRequirementsPDF = async (id: string, reference: string) => {
    setDownloadingId(id);
    try {
      const res = await clientApi.downloadRequirementPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Requirements-${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Unable to download Requirement PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadQuotationPDF = async (submissionId: string) => {
    try {
      const detailRes = await clientApi.getMySubmissionById(submissionId);
      if (detailRes.data.quotation) {
        const quoteId = detailRes.data.quotation.id;
        const res = await clientApi.downloadQuotationPDF(quoteId);
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Quotation-${detailRes.data.quotation.quotationNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch {
      alert('Quotation document is currently in review or unavailable.');
    }
  };

  const handleOpenDetailModal = async (sub: ClientSubmissionDTO) => {
    setActiveModalSub(sub);
    setActiveQuotation(null);
    try {
      const res = await clientApi.getMySubmissionById(sub.id);
      if (res.data.quotation) {
        setActiveQuotation(res.data.quotation);
      }
    } catch {}
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'quoted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Quotation Issued
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            In Development
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Under Engineering Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
            Submitted
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            CLIENT WORKSPACE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            My Project Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track submitted specifications, download formal requirements documents, and access issued proposals.
          </p>
        </div>

        <button
          onClick={onOpenProjectSelector}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Project Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Submissions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {submissions.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Recorded project specifications</span>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold text-slate-400 uppercase">Active Enquiries</p>
          <p className="text-2xl font-black text-brand-500 mt-1">
            {submissions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled').length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">In review or estimation</span>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold text-slate-400 uppercase">Available Quotations</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {submissions.filter((s) => s.quotationAvailable).length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Ready for review & download</span>
        </div>
      </div>

      {/* Submissions List */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-brand-500" />
            <span>Submitted Requirements List</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{submissions.length} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading project submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 dark:text-charcoal-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No project submissions yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Launch our dynamic multi-step requirement form to outline your website or mobile application.
            </p>
            <button
              onClick={onOpenProjectSelector}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-500 text-white shadow-glow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create First Requirement</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-charcoal-750">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Information */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-black text-brand-500 tracking-wide font-mono">
                      {sub.enquiryReference}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300">
                      {sub.projectCategory === 'website' ? (
                        <Globe className="w-3 h-3 text-brand-500" />
                      ) : (
                        <Smartphone className="w-3 h-3 text-blue-500" />
                      )}
                      <span>{sub.projectCategory}</span>
                    </span>
                    {getStatusBadge(sub.status)}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()} at{' '}
                    {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Rev #{sub.revisionNumber}
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Details */}
                  <button
                    onClick={() => handleOpenDetailModal(sub)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-charcoal-750 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Answers</span>
                  </button>

                  {/* Download Requirement PDF */}
                  <button
                    onClick={() => handleDownloadRequirementsPDF(sub.id, sub.enquiryReference)}
                    disabled={downloadingId === sub.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-750 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-brand-500" />
                    <span>Requirement PDF</span>
                  </button>

                  {/* Download Website Quotation (eligible only if quoted) */}
                  {sub.quotationAvailable && (
                    <button
                      onClick={() => handleDownloadQuotationPDF(sub.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Quotation</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answers Detail Modal */}
      {activeModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-500">
                  {activeModalSub.projectCategory.toUpperCase()} REQUIREMENT SPECIFICATION
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Reference: {activeModalSub.enquiryReference}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalSub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Proposal Info Banner if available */}
              {activeQuotation && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Official Proposal Ready</p>
                    <p className="text-sm font-extrabold text-brand-500">
                      Total: {formatINR(activeQuotation.totalPaise)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadQuotationPDF(activeModalSub.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500 text-white shadow-sm cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Proposal PDF</span>
                  </button>
                </div>
              )}

              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Submitted Responses
              </h4>

              <div className="space-y-3">
                {Object.entries(activeModalSub.answers || {}).map(([key, val], idx) => {
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (s) => s.toUpperCase());

                  const displayVal = Array.isArray(val)
                    ? val.join(', ')
                    : typeof val === 'object' && val !== null
                    ? JSON.stringify(val)
                    : String(val);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750"
                    >
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                        {displayVal}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between bg-slate-50 dark:bg-charcoal-900">
              <button
                onClick={() =>
                  handleDownloadRequirementsPDF(activeModalSub.id, activeModalSub.enquiryReference)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Requirement PDF</span>
              </button>
              <button
                onClick={() => setActiveModalSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-charcoal-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
