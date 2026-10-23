import React, { useState, useEffect } from 'react';
import { StickyNote, Lock, Search, Filter, Globe, Smartphone, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminInternalNotesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canManageNotes = hasPermission('manage_internal_notes');

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAllSubmissions()
      .then((res) => {
        if (res.data.success) {
          setSubmissions(res.data.submissions);
          if (res.data.submissions.length > 0) {
            setSelectedSubId(res.data.submissions[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSubId) return;
    adminApi
      .getSubmissionStepNotes(selectedSubId)
      .then((res) => {
        if (res.data.success) setNotes(res.data.notes);
      })
      .catch(() => setNotes([]));
  }, [selectedSubId]);

  if (!canManageNotes) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center max-w-md mx-auto">
        <Lock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Private Notes Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Viewing or editing internal step notes requires the <code>manage_internal_notes</code> permission.
        </p>
      </div>
    );
  }

  const activeSub = submissions.find((s) => s.id === selectedSubId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            CONFIDENTIAL REPOSITORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Internal Step Notes Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dedicated private viewer for administrator notes, complexity assessments, and risk mitigations.
          </p>
        </div>

        {/* Project Selector */}
        <div className="w-full sm:w-72">
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-bold"
          >
            {submissions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.enquiryReference} - {s.clientSnapshot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeSub && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          Showing private notes recorded for submission <strong>{activeSub.enquiryReference}</strong> ({activeSub.clientSnapshot.name}).
          Strict Privacy Rule: These notes are never exported or leaked to client documents.
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center text-slate-400">
          <StickyNote className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-charcoal-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No notes recorded</h3>
          <p className="text-xs text-slate-400 mt-1">
            Open any submission from the submissions table to add private step notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((n) => (
            <div
              key={n.id}
              className="p-5 rounded-3xl glass-card border border-amber-500/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                  Step: {n.stepId}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-750 font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {n.notes}
              </div>

              <p className="text-[10px] text-slate-400 text-right">
                Author: {n.authorName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
