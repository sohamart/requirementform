import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Globe,
  Smartphone,
  Monitor,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileDown,
  Sparkles,
  Info,
  Check,
  FolderKanban,
  Save,
  FileText,
  Edit3,
  Calendar,
  Layers,
  ChevronRight,
  Palette,
  Link2,
  StickyNote,
  Lock,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { publicApi, clientApi } from '../services/api.js';
import { FormDefinitionDTO, FormStep, FormQuestion, ClientSubmissionDTO } from '@shared/types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const RequirementFormPage: React.FC = () => {
  const { category = 'website' } = useParams<{ category: 'website' | 'app' | 'desktop' }>();
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledDomain = (location.state as any)?.prefilledDomain;
  const { user, isAdmin, hasPermission } = useAuth();
  const canAddInternalNotes = isAdmin || hasPermission('manage_internal_notes');

  const [formDef, setFormDef] = useState<FormDefinitionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [stepDeveloperNotes, setStepDeveloperNotes] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ClientSubmissionDTO | null>(null);
  const [needsAuthModal, setNeedsAuthModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load published form definition
  useEffect(() => {
    setLoading(true);
    publicApi
      .getPublishedForm(category as 'website' | 'app' | 'desktop')
      .then((res) => {
        if (res.data.success && res.data.form) {
          setFormDef(res.data.form);

          // Restore autosaved answers and developer notes if available
          const cacheKey = `draft_req_${category}`;
          const saved = localStorage.getItem(cacheKey);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object') {
                if (parsed.answers) {
                  setAnswers(parsed.answers);
                  if (parsed.stepDeveloperNotes) {
                    setStepDeveloperNotes(parsed.stepDeveloperNotes);
                  }
                } else {
                  // Backwards compatibility with raw answers
                  setAnswers(parsed);
                }
                setLastSaved('Restored call draft from device');
              }
            } catch {}
          }

          if (prefilledDomain) {
            setAnswers((prev) => ({
              ...prev,
              own_domain: 'yes',
              domain_name: prefilledDomain,
            }));
            setLastSaved(`Pre-filled domain: ${prefilledDomain}`);
          }
        } else {
          setError('Failed to load published form definition.');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load form definition.');
      })
      .finally(() => setLoading(false));
  }, [category]);

  // Autosave answers & developer notes to localStorage
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      localStorage.setItem(
        `draft_req_${category}`,
        JSON.stringify({ answers: updated, stepDeveloperNotes })
      );
      setLastSaved(new Date().toLocaleTimeString());
      return updated;
    });

    // Clear validation error when answered
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleDeveloperNoteChange = (stepId: string, note: string) => {
    setStepDeveloperNotes((prev) => {
      const updated = { ...prev, [stepId]: note };
      localStorage.setItem(
        `draft_req_${category}`,
        JSON.stringify({ answers, stepDeveloperNotes: updated })
      );
      setLastSaved(new Date().toLocaleTimeString());
      return updated;
    });
  };

  const currentStep: FormStep | undefined = formDef?.steps[currentStepIndex];
  const totalSteps = formDef?.steps.length || 0;
  const isFinalStep = currentStepIndex === totalSteps - 1;
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  // Conditional visibility check
  const isQuestionVisible = (q: FormQuestion): boolean => {
    if (q.isActive === false) return false;
    if (!q.conditionalVisibility) return true;
    const { dependsOnQuestionId, operator, value } = q.conditionalVisibility;
    const currentVal = answers[dependsOnQuestionId];

    switch (operator) {
      case 'equals':
        return currentVal === value;
      case 'not_equals':
        return currentVal !== value;
      case 'contains':
        return (
          (Array.isArray(currentVal) && currentVal.includes(value)) ||
          (typeof currentVal === 'string' && currentVal.includes(value))
        );
      case 'is_not_empty':
        return !!currentVal && currentVal !== '' && (!Array.isArray(currentVal) || currentVal.length > 0);
      default:
        return true;
    }
  };

  // Validate current step before advancing
  const validateCurrentStep = (): boolean => {
    if (!currentStep) return true;
    const errors: Record<string, string> = {};

    currentStep.questions.forEach((q) => {
      if (isQuestionVisible(q) && q.isRequired) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (q.type === 'checkbox' && !val)
        ) {
          errors[q.id] = `${q.label} is required.`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    if (!user) {
      setNeedsAuthModal(true);
      return;
    }

    if (!formDef) return;

    setSubmitting(true);
    try {
      const res = await clientApi.createSubmission({
        formDefinitionId: formDef.id,
        projectCategory: category as 'website' | 'app' | 'desktop',
        answers,
        stepDeveloperNotes: canAddInternalNotes ? stepDeveloperNotes : undefined,
        idempotencyKey: `sub_${user.id}_${formDef.id}_${Date.now()}`,
      });

      if (res.data.success && res.data.submission) {
        setSubmittedData(res.data.submission);
        localStorage.removeItem(`draft_req_${category}`);

        // Trigger celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit requirements. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async (submissionId: string, reference: string) => {
    try {
      const res = await clientApi.downloadRequirementPDF(submissionId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Requirements-${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF document.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center animate-spin mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading requirement builder specification...
        </p>
      </div>
    );
  }

  if (error || !formDef) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 rounded-2xl glass-panel text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Form Unavailable</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-500 text-white"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // --- SUBMISSION CONFIRMATION SCREEN ---
  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 sm:p-10 rounded-3xl glass-panel text-center border-2 border-emerald-500/30 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Requirements Submitted Successfully
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4">
          Project Specification Recorded!
        </h2>

        {/* Reference Highlight Card */}
        <div className="my-6 p-5 rounded-2xl bg-slate-100 dark:bg-charcoal-850 border border-slate-200 dark:border-charcoal-750 max-w-md mx-auto">
          <p className="text-xs text-slate-400 uppercase font-semibold">Your Unique Enquiry Reference</p>
          <p className="text-2xl font-black text-brand-500 tracking-wider mt-1 font-mono">
            {submittedData.enquiryReference}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Category: {submittedData.projectCategory.toUpperCase()} • Revision #{submittedData.revisionNumber}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Your requirement answers have been securely logged in our engineering database. You can download the formal Requirement Details PDF immediately or review your submission status in the Client Portal.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleDownloadPDF(submittedData.id, submittedData.enquiryReference)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Requirement Details PDF</span>
          </button>

          <Link
            to="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-slate-300 dark:border-charcoal-750 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-800 dark:text-white cursor-pointer"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Go to My Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  // --- MULTI-STEP BUILDER INTERFACE ---
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              {category === 'website' ? (
                <Globe className="w-4 h-4" />
              ) : category === 'desktop' ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {category.toUpperCase()} PROJECT SPECIFICATION
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {formDef.title}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-[11px] text-slate-400 block">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-charcoal-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Navigation Tabs Bar (Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 mt-4 overflow-x-auto pb-1">
          {formDef.steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                if (idx < currentStepIndex || validateCurrentStep()) {
                  setCurrentStepIndex(idx);
                }
              }}
              className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate text-center ${
                idx === currentStepIndex
                  ? 'bg-brand-500 text-white shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-charcoal-850 text-slate-500 dark:text-slate-400'
              }`}
            >
              {idx + 1}. {st.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Form Card */}
      {currentStep && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-charcoal-750 shadow-xl">
          {/* Step Header */}
          <div className="border-b border-slate-100 dark:border-charcoal-750 pb-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-brand-500">
                  SECTION {currentStep.order || currentStepIndex + 1}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentStep.title}
                </h2>
                {currentStep.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {currentStep.subtitle}
                  </p>
                )}
              </div>

              {lastSaved && (
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 dark:bg-charcoal-850 px-2.5 py-1 rounded-full border border-slate-200 dark:border-charcoal-750">
                  <Save className="w-3 h-3 text-emerald-500" />
                  <span>Autosaved</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Notice Alert if any error */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Please answer all required questions marked with * before proceeding.</span>
            </div>
          )}

          {/* Step 8 / Step 7 Final Review Screen: Answers Summary Card */}
          {isFinalStep && (
            <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-charcoal-850 border border-slate-200 dark:border-charcoal-750">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Summary of Your Submitted Specifications
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Click any section to review/edit</span>
              </div>

              <div className="space-y-3">
                {formDef.steps
                  .filter((_, idx) => idx < totalSteps - 1)
                  .map((step, idx) => {
                    const answeredCount = step.questions.filter(
                      (q) => isQuestionVisible(q) && answers[q.id] !== undefined && answers[q.id] !== ''
                    ).length;

                    return (
                      <div
                        key={step.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {idx + 1}. {step.title}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {answeredCount} specification items configured
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStepIndex(idx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-500 hover:bg-brand-500/10 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Developer & Team Call Notes Summary on Review Step (Visible strictly to Admin/Authorized Team) */}
              {canAddInternalNotes && (
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-charcoal-750">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Developer & Team Call Notes (Recorded by Step)
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Private • Team Only
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {Object.values(stepDeveloperNotes).filter((t) => t?.trim()).length} of {totalSteps} steps annotated
                    </span>
                  </div>

                  {Object.values(stepDeveloperNotes).some((t) => t?.trim()) ? (
                    <div className="space-y-2 mt-3">
                      {formDef.steps.map((st, idx) => {
                        const note = stepDeveloperNotes[st.id];
                        if (!note || !note.trim()) return null;
                        return (
                          <div
                            key={st.id}
                            className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/[0.04] text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-amber-700 dark:text-amber-400">
                                Step {idx + 1}: {st.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCurrentStepIndex(idx)}
                                className="text-[11px] font-semibold text-brand-500 hover:underline cursor-pointer"
                              >
                                Edit Note
                              </button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {note}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-1">
                      No developer call notes recorded for this intake session. (Optional)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Questions Container */}
          <div className="space-y-6">
            {currentStep.questions
              .filter(isQuestionVisible)
              .map((q) => {
                const value = answers[q.id] ?? '';
                const hasError = !!validationErrors[q.id];

                return (
                  <div
                    key={q.id}
                    className={`space-y-2 p-3 sm:p-4 rounded-2xl transition-all ${
                      hasError
                        ? 'bg-red-500/5 border border-red-500/30'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {q.label} {q.isRequired && <span className="text-red-500">*</span>}
                      </label>
                      {q.helperText && (
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {q.helperText}
                        </span>
                      )}
                    </div>

                    {/* RENDER FIELD BASED ON TYPE */}
                    {/* 1. Text Field */}
                    {q.type === 'text' && (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'Enter response...'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    )}

                    {/* 2. Textarea */}
                    {q.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'Explain in detail...'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    )}

                    {/* 3. Email */}
                    {q.type === 'email' && (
                      <input
                        type="email"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'name@domain.com'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    )}

                    {/* 4. Phone */}
                    {q.type === 'phone' && (
                      <input
                        type="tel"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || '+91 98765 00000'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    )}

                    {/* 5. URL Field */}
                    {q.type === 'url' && (
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'https://domain.com'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono"
                      />
                    )}

                    {/* 6. Number Field */}
                    {q.type === 'number' && (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || '0'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono"
                      />
                    )}

                    {/* 7. Dropdown */}
                    {q.type === 'dropdown' && (
                      <select
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      >
                        <option value="">-- Please Select An Option --</option>
                        {q.options?.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* 8. Radio Buttons / Cards */}
                    {q.type === 'radio' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options?.map((opt, i) => {
                          const isSelected = value === opt;
                          return (
                            <div
                              key={i}
                              onClick={() => handleAnswerChange(q.id, opt)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10'
                                  : 'border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                                {opt}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-brand-500 bg-brand-500'
                                    : 'border-slate-400 dark:border-charcoal-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 9. Multi-select Checkboxes */}
                    {q.type === 'multiselect' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options?.map((opt, i) => {
                          const list: string[] = Array.isArray(value) ? value : [];
                          const isChecked = list.includes(opt);

                          const toggleCheck = () => {
                            if (isChecked) {
                              handleAnswerChange(q.id, list.filter((item) => item !== opt));
                            } else {
                              handleAnswerChange(q.id, [...list, opt]);
                            }
                          };

                          return (
                            <div
                              key={i}
                              onClick={toggleCheck}
                              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                isChecked
                                  ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10'
                                  : 'border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                                {opt}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                                  isChecked
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-slate-400 dark:border-charcoal-600'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 10. Single Checkbox (Accuracy Confirmation) */}
                    {q.type === 'checkbox' && (
                      <div
                        onClick={() => handleAnswerChange(q.id, !value)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                          value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            value
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-400 dark:border-charcoal-600'
                          }`}
                        >
                          {value && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q.options && q.options.length > 0 ? q.options[0] : q.label}
                        </span>
                      </div>
                    )}

                    {/* 11. Repeatable URL / Links */}
                    {q.type === 'repeatable_url' && (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={value}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="https://example.com&#10;https://benchmark.io&#10;https://reference.org"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-xs font-mono focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-[11px] text-slate-400 block">
                          Enter multiple URLs separated by newline or comma.
                        </span>
                      </div>
                    )}

                    {/* 12. Cloud Storage / Drive Link (No native file upload - provides Google Drive / Cloud link) */}
                    {q.type === 'file_upload' && (
                      <div className="p-5 sm:p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-transparent to-brand-500/5 dark:bg-charcoal-850/80 space-y-4">
                        {/* Header & Cloud Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                              <Link2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Google Drive / Cloud Storage Share Link
                              </h5>
                              <p className="text-[11px] text-slate-400">
                                Upload your files to cloud storage and share the access link
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Google Drive
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                              Dropbox
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                              OneDrive
                            </span>
                          </div>
                        </div>

                        {/* Notice & Instructions */}
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs flex items-start gap-2.5">
                          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                          <div className="leading-relaxed">
                            <strong>How to provide your files:</strong> Upload your documents, architecture diagrams, brand guidelines, or requirement files to <strong>Google Drive</strong> (or Dropbox / OneDrive), set link permission to <span className="underline font-bold">"Anyone with the link can view"</span>, and paste the shareable link below.
                          </div>
                        </div>

                        {/* URL Input Box */}
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Globe className="w-4 h-4 text-brand-500" />
                          </div>
                          <input
                            type="url"
                            value={value || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/... or shared cloud link"
                            className="w-full pl-10 pr-20 py-3 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                          />
                          {value && (
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(q.id, '')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-charcoal-800 cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Action feedback & Test link button */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          {value && (value.startsWith('http://') || value.startsWith('https://')) ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>Link attached successfully</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Supports Google Drive folders, PDFs, Figma links, or WeTransfer URLs
                            </span>
                          )}

                          <div className="flex items-center gap-2.5">
                            {value && (value.startsWith('http://') || value.startsWith('https://')) && (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                              >
                                <span>Verify Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <a
                              href="https://drive.google.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-slate-400 hover:text-brand-500 underline cursor-pointer"
                            >
                              Open Google Drive ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 13. Yes / No Switch */}
                    {q.type === 'yes_no' && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(q.id, 'Yes')}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            value === 'Yes'
                              ? 'bg-brand-500 text-white border-brand-500 shadow-glow-sm'
                              : 'border-slate-200 dark:border-charcoal-750 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(q.id, 'No')}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            value === 'No'
                              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                              : 'border-slate-200 dark:border-charcoal-750 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          No / Not Applicable
                        </button>
                      </div>
                    )}

                    {/* 14. Info Block */}
                    {q.type === 'info_block' && (
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-start gap-2.5">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>{q.helperText || q.label}</div>
                      </div>
                    )}

                    {/* Error display */}
                    {hasError && (
                      <p className="text-[11px] text-red-500 font-semibold">{validationErrors[q.id]}</p>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Dedicated Developer / Team Call Notes Card (Visible ONLY to Admin or users granted permission) */}
          {canAddInternalNotes && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-charcoal-750">
              <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/10 via-amber-500/[0.03] to-transparent dark:from-amber-500/[0.08] dark:via-charcoal-850 dark:to-charcoal-900 p-4 sm:p-5 transition-all shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Developer & Team Call Notes — {currentStep.title}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Confidential • Internal Only</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    {stepDeveloperNotes[currentStep.id]?.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Note Saved</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Optional call notes</span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  Filling this form while talking to the client on call? Jot down developer notes, cost estimates, architecture decisions, client nuances, or follow-ups. <strong className="text-slate-700 dark:text-slate-300">Never visible to the client or in client PDFs.</strong>
                </p>

                {/* Quick Preset Tags for live call intake */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'Client budget is flexible',
                    'Existing database to migrate',
                    'Urgent delivery timeline',
                    'Needs custom payment gateway recommendation',
                    'Requested consultation on third-party APIs',
                    'Separate admin roles required',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const cur = stepDeveloperNotes[currentStep.id] || '';
                        const next = cur ? `${cur}\n• ${tag}` : `• ${tag}`;
                        handleDeveloperNoteChange(currentStep.id, next);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-charcoal-700 hover:border-amber-500/60 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Developer Call Notes Textarea */}
                <textarea
                  rows={3}
                  value={stepDeveloperNotes[currentStep.id] || ''}
                  onChange={(e) => handleDeveloperNoteChange(currentStep.id, e.target.value)}
                  placeholder={`Type private call/developer notes for "${currentStep.title}" (e.g. Discussed on call: client prefers PostgreSQL, wants phase-wise payment, high priority on mobile responsiveness, follow-up on logo assets next Tuesday)...`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/35 focus:border-amber-500 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                />

                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>
                    {stepDeveloperNotes[currentStep.id]?.length || 0} characters recorded
                  </span>
                  <span className="italic">
                    Autosaves automatically to your device draft
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sticky / Fixed Navigation Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-charcoal-750 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            {!isFinalStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm hover:shadow-glow-brand transition-all cursor-pointer"
              >
                <span>Continue to Step {currentStepIndex + 2}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all cursor-pointer"
              >
                {submitting ? (
                  <span>Recording Requirements...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete & Submit Requirements</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal Prompt when visitor tries to submit while unauthenticated */}
      {needsAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel border border-brand-500/30 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Sign In to Complete Submission
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your answers are securely saved in your browser draft. Sign in or register in 30 seconds to associate your requirements with your client account and download your official document.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth"
                state={{ from: `/requirements/${category}` }}
                className="w-full block py-3 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm"
              >
                Sign In / Register
              </Link>
              <button
                onClick={() => setNeedsAuthModal(false)}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Continue Editing Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
