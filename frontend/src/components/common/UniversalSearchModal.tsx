import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Layers,
  Sparkles,
  Globe,
  Tag,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  PlusCircle,
} from 'lucide-react';
import { publicApi, domainApi } from '../../services/api.js';
import { PackageDTO, AddonDTO, DomainSuggestion } from '@shared/types/index.js';
import { formatINR } from '@shared/utils/currency.js';
import { smoothScrollTo } from '../../utils/scroll.js';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectSelector: () => void;
}

type SearchTab = 'all' | 'packages' | 'addons' | 'domains' | 'workflows';

const COMMON_EXTENSIONS = ['.com', '.in', '.io', '.ai', '.tech', '.co.in', '.store'];

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenProjectSelector,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [addons, setAddons] = useState<AddonDTO[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Live Domain checking state inside search
  const [domainCheckResults, setDomainCheckResults] = useState<Record<string, DomainSuggestion>>({});
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);

  // Fetch catalog once when modal opens
  useEffect(() => {
    if (isOpen && packages.length === 0) {
      setLoadingCatalog(true);
      Promise.all([publicApi.getPackages(), publicApi.getAddons()])
        .then(([packRes, addonRes]) => {
          if (packRes.data.success) setPackages(packRes.data.packages || []);
          if (addonRes.data.success) setAddons(addonRes.data.addons || []);
        })
        .catch((err) => console.error('Failed to load search catalog:', err))
        .finally(() => setLoadingCatalog(false));
    }
  }, [isOpen]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveTab('all');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clean query keyword
  const cleanQuery = query.trim().toLowerCase();

  // 1. Matched Packages
  const matchedPackages = useMemo(() => {
    if (!cleanQuery) return packages.slice(0, 4);
    return packages.filter((pkg) => {
      const matchName = pkg.name.toLowerCase().includes(cleanQuery);
      const matchDesc = pkg.description?.toLowerCase().includes(cleanQuery);
      const matchCat = pkg.category.toLowerCase().includes(cleanQuery);
      const matchFeatures = pkg.features?.some((f) => f.toLowerCase().includes(cleanQuery));
      const matchPrice =
        formatINR(pkg.offerPricePaise).toLowerCase().includes(cleanQuery) ||
        formatINR(pkg.standardPricePaise).toLowerCase().includes(cleanQuery);
      return matchName || matchDesc || matchCat || matchFeatures || matchPrice;
    });
  }, [packages, cleanQuery]);

  // 2. Matched Addons & Additional Charges
  const matchedAddons = useMemo(() => {
    if (!cleanQuery) return addons.slice(0, 4);
    return addons.filter((addon) => {
      const matchName = addon.name.toLowerCase().includes(cleanQuery);
      const matchDesc = addon.description?.toLowerCase().includes(cleanQuery);
      const matchCat = addon.category.toLowerCase().includes(cleanQuery);
      const matchBilling = addon.billingType.toLowerCase().includes(cleanQuery);
      const matchPrice = formatINR(addon.unitPricePaise).toLowerCase().includes(cleanQuery);
      return matchName || matchDesc || matchCat || matchBilling || matchPrice;
    });
  }, [addons, cleanQuery]);

  // 3. Matched / Generated Domain Candidates
  const domainCandidates = useMemo(() => {
    if (!cleanQuery) {
      return ['mybrand.com', 'startup.io', 'techflow.in', 'aiagent.ai'];
    }
    // Clean raw name (remove spaces, symbols)
    const sanitized = cleanQuery.replace(/[^a-z0-9-.]/g, '');
    if (!sanitized) return [];

    // If query already contains a valid extension
    if (sanitized.includes('.')) {
      return [sanitized];
    }

    // Generate with top extensions
    return COMMON_EXTENSIONS.map((ext) => `${sanitized}${ext}`);
  }, [cleanQuery]);

  // Check GoDaddy availability directly inside modal
  const handleCheckDomain = async (domainName: string) => {
    setCheckingDomain(domainName);
    try {
      const res = await domainApi.checkAvailability([domainName]);
      if (res.data.success && res.data.results.length > 0) {
        setDomainCheckResults((prev) => ({
          ...prev,
          [domainName]: res.data.results[0],
        }));
      }
    } catch {
      // Graceful fallback
    } finally {
      setCheckingDomain(null);
    }
  };

  // Actions
  const handleSelectPackage = (pkg: PackageDTO) => {
    onClose();
    navigate(`/requirements/${pkg.category}?package=${pkg.slug}`);
  };

  const handleSelectAddon = () => {
    onClose();
    if (location.pathname === '/') {
      smoothScrollTo('services');
    } else {
      navigate('/#services');
    }
  };

  const handleOpenDomainAI = (searchDomain?: string) => {
    onClose();
    if (searchDomain) {
      localStorage.setItem('weblets_domain_prefill', searchDomain);
    }
    if (location.pathname === '/') {
      smoothScrollTo('domain-finder');
    } else {
      navigate('/#domain-finder');
    }
  };

  if (!isOpen) return null;

  const totalResultsCount =
    (activeTab === 'all' || activeTab === 'packages' ? matchedPackages.length : 0) +
    (activeTab === 'all' || activeTab === 'addons' ? matchedAddons.length : 0) +
    (activeTab === 'all' || activeTab === 'domains' ? domainCandidates.length : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Alignment Wrapper */}
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6 md:p-8">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-3xl my-4 sm:my-8 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Search Input Bar */}
          <div className="relative p-4 sm:p-5 border-b border-slate-200 dark:border-charcoal-750 flex items-center gap-3 bg-slate-50/70 dark:bg-charcoal-950/70">
            <Search className="w-5 h-5 text-brand-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all packages, domains, additional charges, features..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-charcoal-800 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-slate-200/70 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-charcoal-700">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Badges / Navigation Tabs */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-charcoal-800 bg-white/60 dark:bg-charcoal-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Packages ({matchedPackages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'addons'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Additional Charges ({matchedAddons.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'domains'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domain AI</span>
            </button>
          </div>

          {/* Results Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {loadingCatalog && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                <span className="text-xs">Loading live packages & charges catalog...</span>
              </div>
            )}

            {!loadingCatalog && totalResultsCount === 0 && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-charcoal-800 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No matching results found
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try searching with different terms such as "ecommerce", ".com", "seo", "app", or clear your filter.
                </p>
              </div>
            )}

            {/* SECTION 1: PACKAGES */}
            {(activeTab === 'all' || activeTab === 'packages') && matchedPackages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-brand-500" />
                    <span>Project Packages ({matchedPackages.length})</span>
                  </div>
                  {activeTab === 'all' && matchedPackages.length > 3 && (
                    <button
                      onClick={() => setActiveTab('packages')}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchedPackages.slice(0, activeTab === 'packages' ? 20 : 4).map((pkg) => (
                    <div
                      key={pkg.slug}
                      onClick={() => handleSelectPackage(pkg)}
                      className="group p-4 rounded-xl border border-slate-200/90 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-charcoal-800 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                            {pkg.category === 'desktop' ? 'Desktop App' : pkg.category === 'app' ? 'Mobile App' : 'Website'}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatINR(pkg.offerPricePaise)}
                            </span>
                            {pkg.standardPricePaise > pkg.offerPricePaise && (
                              <span className="ml-1.5 text-xs text-slate-400 line-through">
                                {formatINR(pkg.standardPricePaise)}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                          {pkg.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {pkg.description}
                        </p>

                        {pkg.features?.some((f) => f.toLowerCase().includes('domain') || f.toLowerCase().includes('hosting')) && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <Globe className="w-3 h-3" />
                            <span>1st Year Domain & Hosting Included</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-charcoal-750/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                        <span>Select & Start Requirements</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: ADDITIONAL CHARGES & ADDONS */}
            {(activeTab === 'all' || activeTab === 'addons') && matchedAddons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    <span>Additional Charges & Add-ons ({matchedAddons.length})</span>
                  </div>
                  {activeTab === 'all' && matchedAddons.length > 4 && (
                    <button
                      onClick={() => setActiveTab('addons')}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedAddons.slice(0, activeTab === 'addons' ? 25 : 4).map((addon) => (
                    <div
                      key={addon.slug}
                      onClick={handleSelectAddon}
                      className="p-3.5 rounded-xl border border-slate-200/90 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-blue-500 hover:bg-white dark:hover:bg-charcoal-800 transition-all cursor-pointer flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {addon.name}
                          </h4>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 shrink-0">
                            {addon.billingType === 'monthly' ? '/month' : 'one-time'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {addon.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                          +{formatINR(addon.unitPricePaise)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: DOMAINS (AI & GODADDY LIVE SEARCH) */}
            {(activeTab === 'all' || activeTab === 'domains') && domainCandidates.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Domain Search & Availability</span>
                  </div>
                  <button
                    onClick={() => handleOpenDomainAI(cleanQuery)}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Domain AI Workspace</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {domainCandidates.slice(0, activeTab === 'domains' ? 12 : 4).map((domain) => {
                    const result = domainCheckResults[domain];
                    const isChecking = checkingDomain === domain;

                    return (
                      <div
                        key={domain}
                        className="p-3 rounded-xl border border-slate-200/90 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm truncate">
                            {domain}
                          </span>

                          {result && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                result.available
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {result.available ? 'Available' : 'Taken'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {result?.available && (result.priceFormatted || result.price) && (
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {result.priceFormatted || `₹${result.price}`}
                            </span>
                          )}

                          {!result && (
                            <button
                              type="button"
                              disabled={isChecking}
                              onClick={() => handleCheckDomain(domain)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isChecking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              <span>Check GoDaddy</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenDomainAI(domain)}
                            title="Open in Domain AI Finder"
                            className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 4: QUICK ACTIONS / WORKFLOWS */}
            <div className="pt-2 border-t border-slate-100 dark:border-charcoal-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
                Quick Project Starters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/requirements/website');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 hover:border-brand-500 hover:text-brand-500 text-left transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-brand-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Start Website Requirements
                    </div>
                    <div className="text-[10px] text-slate-500">
                      8-Step Interactive Architecture Builder
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/requirements/app');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 hover:border-blue-500 hover:text-blue-500 text-left transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Start Mobile App Requirements
                    </div>
                    <div className="text-[10px] text-slate-500">
                      7-Step Native/Cross-Platform Scoping
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer with Keyboard Hints */}
          <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-charcoal-750 bg-slate-50/80 dark:bg-charcoal-950/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-charcoal-800 text-[10px] font-mono">
                  ESC
                </kbd>{' '}
                to exit
              </span>
              <span>
                Search live across <strong>Packages</strong>, <strong>Domains</strong> & <strong>Charges</strong>
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
