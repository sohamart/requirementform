import React, { useState } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [defaultValidity, setDefaultValidity] = useState('30');
  const [defaultRevisionLimit, setDefaultRevisionLimit] = useState('3');
  const [targetMarginGlobal, setTargetMarginGlobal] = useState('45');
  const [currencySymbol, setCurrencySymbol] = useState('INR (₹)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
          SYSTEM CONFIGURATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Settings & Commercial Terms
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure default commercial rules, quotation validity windows, and target margin thresholds.
        </p>
      </div>

      <div className="max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-charcoal-750 shadow-xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Quotation Validity (Days)
              </label>
              <input
                type="number"
                min="7"
                max="90"
                value={defaultValidity}
                onChange={(e) => setDefaultValidity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Included Revisions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={defaultRevisionLimit}
                onChange={(e) => setDefaultRevisionLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Company Target Gross Margin (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={targetMarginGlobal}
                onChange={(e) => setTargetMarginGlobal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold text-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Accounting Base Currency
              </label>
              <input
                type="text"
                disabled
                value={currencySymbol}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-100 dark:bg-charcoal-900 text-xs text-slate-400"
              />
            </div>
          </div>

          {saved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Commercial settings updated successfully.</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-charcoal-750 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
