import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Globe,
  Smartphone,
  Monitor,
  Eye,
  FileDown,
  StickyNote,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { adminApi, clientApi } from '../../services/api.js';
import { AdminSubmissionDTO, SubmissionInternalNotesDTO } from '@shared/types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminSubmissionsPage: React.FC = () => {
  const { category: paramCategory } = useParams<{ category: 'website' | 'app' | 'desktop' }>();
  const location = useLocation();

  // Dynamically resolve category from URL or params
  const category: 'website' | 'app' | 'desktop' =
    paramCategory ||
    (location.pathname.includes('/submissions/desktop')
      ? 'desktop'
      : location.pathname.includes('/submissions/app')
      ? 'app'
      : 'website');

  const { hasPermission } = useAuth();
  const canManageNotes = hasPermission('manage_internal_notes');

  const [submissions, setSubmissions] = useState<AdminSubmissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Drawers
  const [activeSub, setActiveSub] = useState<AdminSubmissionDTO | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState<SubmissionInternalNotesDTO[]>([]);
  const [notesStepId, setNotesStepId] = useState('client-info');
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [category, statusFilter]);

  const loadSubmissions = () => {
    setLoading(true);
    adminApi
      .getAllSubmissions({ category, status: statusFilter || undefined })
      .then((res) => {
        if (res.data.success) {
          setSubmissions(res.data.submissions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateSubmissionStatus(id, newStatus);
      loadSubmissions();
      if (activeSub && activeSub.id === id) {
        setActiveSub({ ...activeSub, status: newStatus as any });
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleOpenNotesDrawer = async (sub: AdminSubmissionDTO) => {
    setActiveSub(sub);
    setShowNotesDrawer(true);
    try {
      const res = await adminApi.getSubmissionStepNotes(sub.id);
      if (res.data.success) {
        setSubmissionNotes(res.data.notes);
        // Find existing note for active step
        const existing = res.data.notes.find((n) => n.stepId === notesStepId);
        setCurrentNoteText(existing ? existing.notes : '');
      }
    } catch {
      setSubmissionNotes([]);
    }
  };

  const handleStepTabChange = (stepId: string) => {
    setNotesStepId(stepId);
    const existing = submissionNotes.find((n) => n.stepId === stepId);
    setCurrentNoteText(existing ? existing.notes : '');
  };

  const handleSaveStepNote = async () => {
    if (!activeSub) return;
    setSavingNote(true);
    try {
      await adminApi.saveSubmissionStepNote(activeSub.id, {
        stepId: notesStepId,
        notes: currentNoteText,
      });

      const res = await adminApi.getSubmissionStepNotes(activeSub.id);
      if (res.data.success) setSubmissionNotes(res.data.notes);
      alert('Internal note saved to database.');
    } catch {
      alert('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownloadPDF = async (id: string, ref: string) => {
    try {
      const res = await clientApi.downloadRequirementPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Requirements-${ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download document.');
    }
  };

  const filtered = submissions.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.enquiryReference.toLowerCase().includes(term) ||
      s.clientSnapshot.name.toLowerCase().includes(term) ||
      s.clientSnapshot.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            {category.toUpperCase()} INTAKE MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {category === 'desktop'
              ? 'Desktop Software'
              : category === 'app'
              ? 'Mobile App'
              : 'Website'}{' '}
            Requirement Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review structured client responses, configure private internal step notes, and generate quotations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/quotations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-glow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, client or email..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="quoted">Quoted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No {category} requirement submissions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-900/50 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Private Notes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750 text-xs font-medium">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-500">
                      {s.enquiryReference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.clientSnapshot.name}
                      {s.clientSnapshot.company && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {s.clientSnapshot.company}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.clientSnapshot.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 text-xs font-semibold cursor-pointer"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="estimated">Estimated</option>
                        <option value="quoted">Quoted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {canManageNotes ? (
                        <button
                          onClick={() => handleOpenNotesDrawer(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <StickyNote className="w-3.5 h-3.5" />
                          <span>Notes ({s.internalNotesCount || 0})</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Restricted</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSub(s);
                            setShowNotesDrawer(false);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer"
                          title="View Responses"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(s.id, s.enquiryReference)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 cursor-pointer"
                          title="Download Requirements PDF"
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
        )}
      </div>

      {/* Answers Detail View Modal */}
      {activeSub && !showNotesDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-500">
                  {activeSub.projectCategory.toUpperCase()} CLIENT SPECIFICATION
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Ref: {activeSub.enquiryReference} • {activeSub.clientSnapshot.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveSub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {Object.entries(activeSub.answers || {}).map(([key, val], idx) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (c) => c.toUpperCase());
                const strVal =
                  Array.isArray(val)
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
                      {strVal}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-charcoal-750 flex justify-end gap-2 bg-slate-50 dark:bg-charcoal-900">
              <button
                onClick={() => handleDownloadPDF(activeSub.id, activeSub.enquiryReference)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Requirements PDF</span>
              </button>
              <button
                onClick={() => setActiveSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Internal Step Notes Drawer */}
      {showNotesDrawer && activeSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white dark:bg-charcoal-900 border-l border-slate-200 dark:border-charcoal-750 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-charcoal-750">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                    STRICTLY PRIVATE
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Ref: {activeSub.enquiryReference}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Submission Internal Step Notes
                </h3>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Warning Banner */}
            <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              <strong>Strict Privacy Rule:</strong> These notes are never visible to the client, never included in Requirement PDFs, and never included in client quotations.
            </div>

            {/* Step Selection Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-charcoal-750">
              {(activeSub.projectCategory === 'desktop'
                ? [
                    { id: 'client-info', label: '1. Client Info' },
                    { id: 'desktop-overview', label: '2. Overview' },
                    { id: 'os-platforms', label: '3. Platforms' },
                    { id: 'tech-architecture', label: '4. Tech Architecture' },
                    { id: 'hardware-integration', label: '5. Hardware & Printers' },
                    { id: 'database-security', label: '6. DB & Security' },
                    { id: 'packaging-distribution', label: '7. Distribution' },
                    { id: 'desktop-budget', label: '8. Budget & Timeline' },
                  ]
                : activeSub.projectCategory === 'app'
                ? [
                    { id: 'client-info', label: '1. Client Info' },
                    { id: 'app-overview', label: '2. Overview' },
                    { id: 'platforms-devices', label: '3. Platforms' },
                    { id: 'app-architecture', label: '4. Tech Architecture' },
                    { id: 'security-compliance', label: '5. Security' },
                    { id: 'maintenance-services', label: '6. Maintenance' },
                    { id: 'app-budget', label: '7. Budget & Timeline' },
                  ]
                : [
                    { id: 'client-info', label: '1. Client Info' },
                    { id: 'website-overview', label: '2. Overview' },
                    { id: 'pages-and-content', label: '3. Scope' },
                    { id: 'features-integrations', label: '4. Features' },
                    { id: 'design-branding', label: '5. Design' },
                    { id: 'domain-hosting', label: '6. Domain & Host' },
                    { id: 'timeline-maintenance', label: '7. Timeline' },
                    { id: 'budget-preferences', label: '8. Budget' },
                  ]
              ).map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepTabChange(step.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    notesStepId === step.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>

            {/* Note Editor */}
            <div className="flex-1 py-4 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Internal Commentary for Step: <code>{notesStepId}</code>
              </label>

              <textarea
                rows={10}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Enter internal developer guidelines, complexity assessments, contractor split instructions, or follow-up notes for this step..."
                className="flex-1 w-full p-4 rounded-2xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Saved with audit tracking
              </span>
              <button
                onClick={handleSaveStepNote}
                disabled={savingNote}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Private Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
