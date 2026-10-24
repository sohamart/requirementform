import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  StickyNote,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Layers,
  Sparkles,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { adminApi, publicApi } from '../../services/api.js';
import { FormDefinitionDTO, FormStep, FormQuestion, QuestionType } from '@shared/types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminFormBuilderPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canManageNotes = hasPermission('manage_internal_notes');

  const [category, setCategory] = useState<'website' | 'app' | 'desktop'>('website');
  const [formDef, setFormDef] = useState<FormDefinitionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewStepIndex, setPreviewStepIndex] = useState(0);

  // Active Editing States
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [stepNoteText, setStepNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Question editing modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<FormQuestion>>({
    id: '',
    fieldKey: '',
    label: '',
    helperText: '',
    placeholder: '',
    type: 'text',
    isRequired: false,
    isActive: true,
    options: [],
    order: 0,
    validationRules: {},
    conditionalVisibility: undefined,
  });
  const [optionsRaw, setOptionsRaw] = useState('');
  const [hasConditional, setHasConditional] = useState(false);
  const [condDependsOn, setCondDependsOn] = useState('');
  const [condOperator, setCondOperator] = useState<'equals' | 'not_equals' | 'contains' | 'is_not_empty'>('equals');
  const [condValue, setCondValue] = useState('');

  useEffect(() => {
    loadForm();
  }, [category]);

  const loadForm = () => {
    setLoading(true);
    publicApi
      .getPublishedForm(category)
      .then((res) => {
        if (res.data.success && res.data.form) {
          setFormDef(res.data.form);
          setSelectedStepIndex(0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const currentStep = formDef?.steps[selectedStepIndex];

  // All questions across all steps for conditional dependency selection
  const allOtherQuestions =
    formDef?.steps
      .flatMap((s) => s.questions)
      .filter((q) => q.id !== editingQuestion.id) || [];

  // Step Management
  const handleAddStep = () => {
    if (!formDef) return;
    const newStepId = `step-${Date.now()}`;
    const newStep: FormStep = {
      id: newStepId,
      title: 'New Section Step',
      subtitle: 'Configure section details and fields',
      order: formDef.steps.length + 1,
      questions: [],
    };

    setFormDef({
      ...formDef,
      steps: [...formDef.steps, newStep],
    });
    setSelectedStepIndex(formDef.steps.length);
  };

  const handleDeleteStep = (idx: number) => {
    if (!formDef || formDef.steps.length <= 1) {
      alert('A form must have at least one step.');
      return;
    }
    if (!confirm('Are you sure you want to delete this entire step and its questions?')) return;
    const updated = formDef.steps.filter((_, i) => i !== idx);
    setFormDef({ ...formDef, steps: updated });
    setSelectedStepIndex(Math.max(0, idx - 1));
  };

  const handleDuplicateStep = (idx: number) => {
    if (!formDef) return;
    const target = formDef.steps[idx];
    const clonedStep: FormStep = {
      ...target,
      id: `${target.id}_copy_${Date.now().toString().slice(-4)}`,
      title: `${target.title} (Copy)`,
      order: formDef.steps.length + 1,
      questions: target.questions.map((q) => ({
        ...q,
        id: `${q.id}_copy_${Date.now().toString().slice(-4)}`,
        fieldKey: q.fieldKey ? `${q.fieldKey}_copy` : undefined,
      })),
    };
    const updatedSteps = [...formDef.steps];
    updatedSteps.splice(idx + 1, 0, clonedStep);
    setFormDef({ ...formDef, steps: updatedSteps });
    setSelectedStepIndex(idx + 1);
  };

  const handleMoveStep = (idx: number, direction: 'up' | 'down') => {
    if (!formDef) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= formDef.steps.length) return;

    const updated = [...formDef.steps];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;

    // re-assign order numbers
    updated.forEach((s, i) => {
      s.order = i + 1;
    });

    setFormDef({ ...formDef, steps: updated });
    setSelectedStepIndex(newIdx);
  };

  // Question Management
  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      id: `q_${Date.now()}`,
      fieldKey: `field_${Date.now()}`,
      label: '',
      helperText: '',
      placeholder: '',
      type: 'text',
      isRequired: false,
      isActive: true,
      options: [],
      order: (currentStep?.questions.length || 0) + 1,
      validationRules: {},
      conditionalVisibility: undefined,
    });
    setOptionsRaw('');
    setHasConditional(false);
    setCondDependsOn('');
    setCondOperator('equals');
    setCondValue('');
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: FormQuestion) => {
    setEditingQuestion({ ...q });
    setOptionsRaw(q.options ? q.options.join('\n') : '');
    if (q.conditionalVisibility) {
      setHasConditional(true);
      setCondDependsOn(q.conditionalVisibility.dependsOnQuestionId);
      setCondOperator(q.conditionalVisibility.operator);
      setCondValue(q.conditionalVisibility.value || '');
    } else {
      setHasConditional(false);
      setCondDependsOn('');
      setCondOperator('equals');
      setCondValue('');
    }
    setShowQuestionModal(true);
  };

  const handleDuplicateQuestion = (q: FormQuestion) => {
    if (!formDef || !currentStep) return;
    const clonedQuestion: FormQuestion = {
      ...q,
      id: `${q.id}_copy_${Date.now().toString().slice(-4)}`,
      fieldKey: q.fieldKey ? `${q.fieldKey}_copy` : `field_${Date.now()}`,
      label: `${q.label} (Copy)`,
      order: currentStep.questions.length + 1,
    };
    const updatedQuestions = [...currentStep.questions, clonedQuestion];
    const updatedSteps = [...formDef.steps];
    updatedSteps[selectedStepIndex] = {
      ...currentStep,
      questions: updatedQuestions,
    };
    setFormDef({ ...formDef, steps: updatedSteps });
  };

  const handleMoveQuestion = (qIdx: number, direction: 'up' | 'down') => {
    if (!formDef || !currentStep) return;
    const newIdx = direction === 'up' ? qIdx - 1 : qIdx + 1;
    if (newIdx < 0 || newIdx >= currentStep.questions.length) return;

    const updatedQ = [...currentStep.questions];
    const temp = updatedQ[qIdx];
    updatedQ[qIdx] = updatedQ[newIdx];
    updatedQ[newIdx] = temp;

    updatedQ.forEach((q, i) => {
      q.order = i + 1;
    });

    const updatedSteps = [...formDef.steps];
    updatedSteps[selectedStepIndex] = {
      ...currentStep,
      questions: updatedQ,
    };
    setFormDef({ ...formDef, steps: updatedSteps });
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!formDef || !currentStep) return;
    const updatedQuestions = currentStep.questions.filter((q) => q.id !== qId);
    const updatedSteps = [...formDef.steps];
    updatedSteps[selectedStepIndex] = {
      ...currentStep,
      questions: updatedQuestions,
    };
    setFormDef({ ...formDef, steps: updatedSteps });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDef || !currentStep || !editingQuestion.label) return;

    const parsedOptions = optionsRaw
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean);

    const fullQuestion: FormQuestion = {
      id: editingQuestion.id || `q_${Date.now()}`,
      fieldKey: editingQuestion.fieldKey || editingQuestion.id || `field_${Date.now()}`,
      label: editingQuestion.label,
      helperText: editingQuestion.helperText,
      placeholder: editingQuestion.placeholder,
      type: (editingQuestion.type as QuestionType) || 'text',
      isRequired: !!editingQuestion.isRequired,
      isActive: editingQuestion.isActive !== false,
      options: parsedOptions.length > 0 ? parsedOptions : undefined,
      order: editingQuestion.order || currentStep.questions.length + 1,
      validationRules: editingQuestion.validationRules,
      conditionalVisibility:
        hasConditional && condDependsOn
          ? {
              dependsOnQuestionId: condDependsOn,
              operator: condOperator,
              value: condValue,
            }
          : undefined,
    };

    const existingIdx = currentStep.questions.findIndex((q) => q.id === fullQuestion.id);
    let updatedQuestions = [...currentStep.questions];

    if (existingIdx >= 0) {
      updatedQuestions[existingIdx] = fullQuestion;
    } else {
      updatedQuestions.push(fullQuestion);
    }

    const updatedSteps = [...formDef.steps];
    updatedSteps[selectedStepIndex] = {
      ...currentStep,
      questions: updatedQuestions,
    };

    setFormDef({ ...formDef, steps: updatedSteps });
    setShowQuestionModal(false);
  };

  // Private Step Notes
  const handleOpenStepNotes = async () => {
    if (!formDef || !currentStep) return;
    setShowNotesModal(true);
    try {
      const res = await adminApi.getFormStepNotes(formDef.id, formDef.version);
      const match = res.data.notes.find((n) => n.stepId === currentStep.id);
      setStepNoteText(match ? match.notes : '');
    } catch {
      setStepNoteText('');
    }
  };

  const handleSaveStepNote = async () => {
    if (!formDef || !currentStep) return;
    setSavingNote(true);
    try {
      await adminApi.saveFormStepNote(formDef.id, {
        stepId: currentStep.id,
        notes: stepNoteText,
        formVersion: formDef.version,
      });
      alert('Internal form configuration notes saved to database.');
      setShowNotesModal(false);
    } catch {
      alert('Failed to save private note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Publishing / Saving
  const handlePublishNewVersion = async () => {
    if (!formDef) return;
    if (!confirm('Publishing will deploy this form definition live for all client requirement workflows. Continue?')) {
      return;
    }

    setSaving(true);
    try {
      await adminApi.updateForm(formDef.id, {
        title: formDef.title,
        description: formDef.description,
        steps: formDef.steps,
      });

      await adminApi.publishForm(formDef.id);
      alert('Form definition successfully published!');
      loadForm();
    } catch {
      alert('Failed to publish form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            DYNAMIC FORM ENGINE & VERSIONING
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Dynamic Form Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-step client questions, field keys, conditional logic, and internal developer step notes.
          </p>
        </div>

        {/* Category Switcher, Preview & Publish Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 dark:bg-charcoal-800 p-1">
            <button
              onClick={() => setCategory('website')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                category === 'website'
                  ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Website Form
            </button>
            <button
              onClick={() => setCategory('app')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                category === 'app'
                  ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              App Form
            </button>
            <button
              onClick={() => setCategory('desktop')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                category === 'desktop'
                  ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Desktop App Form
            </button>
          </div>

          <button
            onClick={() => {
              setPreviewStepIndex(0);
              setShowPreviewModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-brand-500" />
            <span>Preview Form</span>
          </button>

          <button
            onClick={handlePublishNewVersion}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{saving ? 'Publishing...' : 'Publish Live Version'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">Loading form builder...</div>
      ) : !formDef ? (
        <div className="py-12 text-center text-slate-400">No form definition found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Steps Navigator & Reordering */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-charcoal-750">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Form Steps ({formDef.steps.length})
                </span>
                <button
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-2">
                {formDef.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                      idx === selectedStepIndex
                        ? 'bg-brand-500/10 border-brand-500 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-850 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedStepIndex(idx)}
                      className="flex-1 cursor-pointer truncate mr-2"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-brand-500">
                        Step {idx + 1}
                      </span>
                      <p className="text-xs font-bold truncate">{step.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {step.questions.length} questions
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => handleMoveStep(idx, 'up')}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        title="Move Down"
                        disabled={idx === formDef.steps.length - 1}
                        onClick={() => handleMoveStep(idx, 'down')}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        title="Duplicate Step"
                        onClick={() => handleDuplicateStep(idx)}
                        className="p-1 rounded text-slate-400 hover:text-brand-500 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {formDef.steps.length > 1 && (
                        <button
                          title="Delete Step"
                          onClick={() => handleDeleteStep(idx)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Active Step Editor & Questions */}
          <div className="lg:col-span-8 space-y-4">
            {currentStep && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-charcoal-750">
                {/* Step Metadata Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-charcoal-750 pb-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-extrabold uppercase text-brand-500">
                      EDITING STEP {selectedStepIndex + 1} OF {formDef.steps.length}
                    </span>
                    <input
                      type="text"
                      value={currentStep.title}
                      onChange={(e) => {
                        const updated = [...formDef.steps];
                        updated[selectedStepIndex].title = e.target.value;
                        setFormDef({ ...formDef, steps: updated });
                      }}
                      placeholder="Step Title"
                      className="block text-xl font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-charcoal-700 focus:border-brand-500 focus:outline-none w-full mt-1"
                    />
                    <input
                      type="text"
                      value={currentStep.subtitle || ''}
                      onChange={(e) => {
                        const updated = [...formDef.steps];
                        updated[selectedStepIndex].subtitle = e.target.value;
                        setFormDef({ ...formDef, steps: updated });
                      }}
                      placeholder="Step Subtitle (optional)"
                      className="block text-xs text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none w-full mt-1"
                    />
                  </div>

                  {/* Private Step Notes Trigger on EVERY Step */}
                  <div className="flex items-center gap-2">
                    {canManageNotes && (
                      <button
                        onClick={handleOpenStepNotes}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <StickyNote className="w-4 h-4" />
                        <span>Private Step Notes</span>
                      </button>
                    )}

                    <button
                      onClick={handleOpenAddQuestion}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-glow-sm cursor-pointer hover:bg-brand-600"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {/* Questions List for this Step */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400">
                      Step Questions ({currentStep.questions.length})
                    </h4>
                  </div>

                  {currentStep.questions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No questions in this step. Click "Add Question" above to add fields.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentStep.questions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                                {q.type === 'file_upload' ? 'Cloud Link (Drive/Dropbox)' : q.type}
                              </span>
                              {q.isRequired && (
                                <span className="text-[10px] font-bold text-red-500 uppercase">
                                  Required
                                </span>
                              )}
                              {q.isActive === false && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200 dark:bg-charcoal-750 px-2 py-0.5 rounded">
                                  Inactive
                                </span>
                              )}
                              {q.fieldKey && (
                                <span className="text-[10px] text-amber-500 dark:text-amber-400 font-mono">
                                  key: {q.fieldKey}
                                </span>
                              )}
                              {q.conditionalVisibility && (
                                <span className="text-[10px] text-blue-500 font-semibold">
                                  ⚡ conditional ({q.conditionalVisibility.dependsOnQuestionId})
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                              {q.label}
                            </p>
                            {q.helperText && (
                              <p className="text-xs text-slate-400 mt-0.5">{q.helperText}</p>
                            )}
                            {q.options && q.options.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                Options ({q.options.length}): {q.options.slice(0, 3).join(', ')}
                                {q.options.length > 3 ? ` (+${q.options.length - 3} more)` : ''}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                              title="Move Up"
                              disabled={qIdx === 0}
                              onClick={() => handleMoveQuestion(qIdx, 'up')}
                              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Move Down"
                              disabled={qIdx === currentStep.questions.length - 1}
                              onClick={() => handleMoveQuestion(qIdx, 'down')}
                              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Duplicate Question"
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-1.5 rounded text-slate-400 hover:text-brand-500 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-charcoal-750 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              title="Delete Question"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PRIVATE FORM STEP NOTES MODAL (Admin Only) --- */}
      {showNotesModal && currentStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-charcoal-750">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                  FORM DESIGN INTERNAL GUIDELINES
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Private Step Notes: {currentStep.title}
                </h3>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3">
              Configure development instructions, complexity assessments, risks, or margin guidelines for this step. These notes are completely private and never visible to clients.
            </p>

            <textarea
              rows={8}
              value={stepNoteText}
              onChange={(e) => setStepNoteText(e.target.value)}
              placeholder="e.g. If client selects custom e-commerce gateway, verify KYC requirements. Ensure baseline package margin >= 45%..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono focus:outline-none focus:border-brand-500"
            />

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStepNote}
                disabled={savingNote}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-sm"
              >
                {savingNote ? 'Saving...' : 'Save Private Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT QUESTION MODAL (Comprehensive Editor) --- */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-charcoal-750 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Configure Form Question
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingQuestion.label}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  placeholder="e.g. What is your estimated total page count?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Field Key * (Stable Identifier)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.fieldKey || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, fieldKey: e.target.value })
                    }
                    placeholder="e.g. approx_page_count"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Input Type
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text (Textarea)</option>
                    <option value="email">Email Address</option>
                    <option value="phone">Phone Number</option>
                    <option value="number">Number</option>
                    <option value="url">Website URL</option>
                    <option value="dropdown">Dropdown Select</option>
                    <option value="radio">Radio Buttons / Cards</option>
                    <option value="multiselect">Multi-Select Checkboxes</option>
                    <option value="checkbox">Single Confirmation Checkbox</option>
                    <option value="date">Date</option>
                    <option value="budget_range">Budget Range</option>
                    <option value="file_upload">Cloud Storage Link (Google Drive / Dropbox)</option>
                    <option value="yes_no">Yes / No Switch</option>
                    <option value="info_block">Informational Callout</option>
                    <option value="color_picker">Color Picker / Dropdown</option>
                    <option value="repeatable_url">Repeatable URL Fields</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Description / Helper Text
                </label>
                <input
                  type="text"
                  value={editingQuestion.helperText || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, helperText: e.target.value })
                  }
                  placeholder="e.g. Choose the option closest to your needs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Placeholder (Text inputs)
                </label>
                <input
                  type="text"
                  value={editingQuestion.placeholder || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })
                  }
                  placeholder="e.g. Enter details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              {/* Options Editor (One per line) */}
              {['dropdown', 'radio', 'multiselect', 'color_picker'].includes(
                editingQuestion.type || ''
              ) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Options (Enter one option per line)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {optionsRaw.split('\n').filter((s) => s.trim()).length} options configured
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={optionsRaw}
                    onChange={(e) => setOptionsRaw(e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                  />
                </div>
              )}

              {/* Toggles: Required & Active */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingQuestion.isRequired}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, isRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Mandatory / Required Field
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingQuestion.isActive !== false}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Active in Client Form
                  </span>
                </label>
              </div>

              {/* Conditional Visibility Engine */}
              <div className="pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={hasConditional}
                    onChange={(e) => setHasConditional(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Conditional Visibility (Show when another field matches)
                  </span>
                </label>

                {hasConditional && (
                  <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Depends on Question
                      </label>
                      <select
                        value={condDependsOn}
                        onChange={(e) => setCondDependsOn(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 text-xs"
                      >
                        <option value="">-- Select Parent Question --</option>
                        {allOtherQuestions.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.label} ({q.fieldKey || q.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Operator
                        </label>
                        <select
                          value={condOperator}
                          onChange={(e) => setCondOperator(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 text-xs"
                        >
                          <option value="equals">Equals (Exact match)</option>
                          <option value="not_equals">Does not equal</option>
                          <option value="contains">Contains (for multi-select)</option>
                          <option value="is_not_empty">Is answered (not empty)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Matching Value
                        </label>
                        <input
                          type="text"
                          value={condValue}
                          onChange={(e) => setCondValue(e.target.value)}
                          placeholder="e.g. Yes, Other"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIVE FORM PREVIEW MODAL --- */}
      {showPreviewModal && formDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel border border-brand-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-charcoal-750 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">
                  CLIENT VIEW PREVIEW (STEP {previewStepIndex + 1} OF {formDef.steps.length})
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formDef.title}
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Step Content */}
            {formDef.steps[previewStepIndex] && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {formDef.steps[previewStepIndex].title}
                  </h4>
                  {formDef.steps[previewStepIndex].subtitle && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formDef.steps[previewStepIndex].subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {formDef.steps[previewStepIndex].questions
                    .filter((q) => q.isActive !== false)
                    .map((q) => (
                      <div key={q.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-charcoal-850">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {q.label} {q.isRequired && <span className="text-red-500">*</span>}
                        </label>
                        {q.helperText && <p className="text-[11px] text-slate-400">{q.helperText}</p>}
                        {['text', 'email', 'phone', 'url', 'number'].includes(q.type) && (
                          <input
                            type="text"
                            disabled
                            placeholder={q.placeholder || 'Client text input...'}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs"
                          />
                        )}
                        {q.type === 'textarea' && (
                          <textarea
                            disabled
                            rows={2}
                            placeholder={q.placeholder || 'Client long text input...'}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs"
                          />
                        )}
                        {q.type === 'dropdown' && (
                          <select disabled className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs">
                            <option>-- Select an Option --</option>
                            {q.options?.map((o, idx) => (
                              <option key={idx}>{o}</option>
                            ))}
                          </select>
                        )}
                        {['radio', 'multiselect'].includes(q.type) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {q.options?.map((o, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs flex items-center justify-between"
                              >
                                <span>{o}</span>
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-charcoal-750">
                  <button
                    disabled={previewStepIndex === 0}
                    onClick={() => setPreviewStepIndex((p) => p - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-charcoal-700 disabled:opacity-30 cursor-pointer"
                  >
                    Previous Step
                  </button>
                  <button
                    disabled={previewStepIndex === formDef.steps.length - 1}
                    onClick={() => setPreviewStepIndex((p) => p + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white disabled:opacity-30 cursor-pointer"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
