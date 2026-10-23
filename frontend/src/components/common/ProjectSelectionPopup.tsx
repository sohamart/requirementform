import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone, Monitor, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProjectSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSelectionPopup: React.FC<ProjectSelectionPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (category: 'website' | 'app' | 'desktop') => {
    onClose();
    navigate(`/requirements/${category}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centering & Scrollable wrapper */}
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Modal Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="selection-title"
          className="relative w-full max-w-5xl my-6 sm:my-8 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 shadow-2xl p-5 sm:p-8 z-10 overflow-hidden"
        >
          {/* Subtle Brand Glow Effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 pt-1 sm:pt-0 pr-8 sm:pr-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-2.5 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Requirement Builder</span>
            </div>
            <h2 id="selection-title" className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              What would you like to build?
            </h2>
            <p className="mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Select your project domain to launch the specialized multi-step requirements specification workflow.
            </p>
          </div>

          {/* Options Grid (3 Categories) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Option 1: Website Project */}
            <div
              onClick={() => handleSelect('website')}
              className="group relative flex flex-col p-5 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-charcoal-850 hover:shadow-glow-brand transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                  Web Solutions
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                Website Project
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                Landing pages, corporate websites, portfolios, e-commerce stores, appointment booking, LMS portals, and custom web applications.
              </p>

              <ul className="mt-3 sm:mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Domain & hosting inclusive packages</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Instant requirement PDF & quotation</span>
                </li>
              </ul>

              <div className="mt-4 sm:mt-6 flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                <span>Start Website Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option 2: Mobile App Project */}
            <div
              onClick={() => handleSelect('app')}
              className="group relative flex flex-col p-5 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-charcoal-850 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                  Mobile Apps
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Mobile App Project
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                Native Android apps, iOS applications, cross-platform apps (React Native/Flutter), progressive web apps, and customer portals.
              </p>

              <ul className="mt-3 sm:mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Screen architecture & user roles mapping</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Play Store & App Store deployment prep</span>
                </li>
              </ul>

              <div className="mt-4 sm:mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Start Mobile Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option 3: Desktop App Project */}
            <div
              onClick={() => handleSelect('desktop')}
              className="group relative flex flex-col p-5 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-charcoal-850 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                  Desktop Software
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                Desktop App Project
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                Fast, offline-first desktop software for Windows, macOS, and Linux. POS billing, inventory, enterprise ERP, and utility suites.
              </p>

              <ul className="mt-3 sm:mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Thermal printers, scanners & hardware drivers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Encrypted offline DB & code-signed installer</span>
                </li>
              </ul>

              <div className="mt-4 sm:mt-6 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Start Desktop Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-charcoal-750 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All 3 workflows save your progress automatically. You can review specifications and download your Requirement Details PDF immediately upon completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
