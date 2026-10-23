import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Globe,
  Server,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PackageDTO } from '@shared/types/index.js';
import { formatINR } from '@shared/utils/currency.js';

interface PackageDetailsModalProps {
  packageItem: PackageDTO | null;
  onClose: () => void;
  onSelect: (pkg: PackageDTO) => void;
}

export const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({
  packageItem,
  onClose,
  onSelect,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (packageItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [packageItem, onClose]);

  if (!packageItem) return null;

  const hasDiscount = packageItem.standardPricePaise > packageItem.offerPricePaise;
  const savings = hasDiscount ? packageItem.standardPricePaise - packageItem.offerPricePaise : 0;
  const hasDomainOrHosting = packageItem.features.some(
    (f) =>
      f.toLowerCase().includes('1st year') ||
      f.toLowerCase().includes('domain') ||
      f.toLowerCase().includes('hosting')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Centering wrapper */}
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Modal Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-2xl my-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200/90 dark:border-charcoal-750 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {hasDomainOrHosting ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 dark:border-emerald-400/35 shadow-xs whitespace-nowrap">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>1st Yr Domain & Hosting Included</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100/90 dark:bg-charcoal-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-charcoal-750 shadow-2xs">
                  <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>
                    {packageItem.category === 'desktop'
                      ? 'Desktop Software'
                      : packageItem.category === 'app'
                      ? 'Mobile App Project'
                      : 'Website Tier'}
                  </span>
                </span>
              )}

              {hasDiscount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-tight bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 dark:from-emerald-950/70 dark:via-teal-950/60 dark:to-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 dark:border-emerald-400/40 shadow-xs whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Save {formatINR(savings)} (Offer)</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {packageItem.name}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {packageItem.description}
            </p>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/80 dark:border-charcoal-750 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">
                  Investment
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-brand-500">
                    {formatINR(packageItem.offerPricePaise)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatINR(packageItem.standardPricePaise)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300">
                  {packageItem.billingFrequency === 'monthly' ? 'Billed Monthly' : 'One-time Project'}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
            {/* 1st Year Domain & Hosting Transparency Card */}
            {hasDomainOrHosting && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mb-1.5">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1st Year Domain & SSD Cloud Hosting Included</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    ✓ <strong>Free 1st Year Domain:</strong> Standard .com, .in, or .co.in domain name registration included for 1 full year.
                  </p>
                  <p>
                    ✓ <strong>Free 1st Year Cloud Hosting:</strong> High-speed NVMe/SSD cloud hosting with free SSL & CDN included for 1 full year.
                  </p>
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[11px] font-medium text-emerald-800 dark:text-emerald-300/90 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Renewal Policy: Domain and hosting are 100% free for Year 1. Standard annual renewal fee will apply starting from the 2nd year onwards.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Included Benefits Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Complete Deliverables & Features ({packageItem.features.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {packageItem.features.map((feature, i) => {
                  const isDomainHost =
                    feature.toLowerCase().includes('1st year') ||
                    feature.toLowerCase().includes('domain') ||
                    feature.toLowerCase().includes('hosting');

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isDomainHost
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-slate-50/70 dark:bg-charcoal-850/70 border-slate-200/80 dark:border-charcoal-750 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isDomainHost ? 'text-emerald-500' : 'text-brand-500'
                        }`}
                      />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-charcoal-750 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Includes guaranteed handover, verified milestones, and code ownership.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelect(packageItem);
                }}
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer app-press"
              >
                <span>Select & Start Requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
