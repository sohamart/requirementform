import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProjectSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSelectionPopup: React.FC<ProjectSelectionPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (category: 'website' | 'app') => {
    onClose();
    navigate(`/requirements/${category}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-title"
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
      >
        {/* Subtle Brand Glow Effect */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Project Requirement Builder</span>
          </div>
          <h2 id="selection-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            What would you like to build?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Select your project domain to launch the specialized multi-step requirements specification workflow.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: Website Project */}
          <div
            onClick={() => handleSelect('website')}
            className="group relative flex flex-col p-6 rounded-2xl border-2 border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-charcoal-850 hover:shadow-glow-brand transition-all duration-200 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                Web Solutions
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
              Website Project
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
              Landing pages, corporate websites, portfolios, blogs, e-commerce stores, appointment booking, LMS platforms, and custom web applications.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Standard & offer package catalogue available</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Instant requirement PDF & quotation download</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
              <span>Start Website Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: App Project */}
          <div
            onClick={() => handleSelect('app')}
            className="group relative flex flex-col p-6 rounded-2xl border-2 border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-charcoal-850 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                Mobile & Software
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
              App Project
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
              Native Android apps, iOS applications, cross-platform apps (React Native/Flutter), progressive web apps, and custom business software.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Screen architecture & user roles mapping</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Dedicated app scoping & proposal workflow</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Start App Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-charcoal-750 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Both workflows save your progress automatically. You can review specifications and download your Requirement Details PDF immediately upon completion.
          </p>
        </div>
      </div>
    </div>
  );
};
