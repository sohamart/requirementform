import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Heart,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  Tag,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { domainApi } from '../../services/api.js';
import {
  BusinessType,
  DomainSuggestion,
  GoDaddyStatusDTO,
} from '@shared/types/index.js';

const BUSINESS_TYPES: BusinessType[] = [
  'Agency',
  'SaaS',
  'AI/Technology',
  'E-commerce',
  'Startup',
  'Healthcare',
  'Finance',
  'Education',
  'Restaurant',
  'Fashion',
  'Portfolio',
  'Other',
];

const POPULAR_EXTENSIONS = [
  '.com',
  '.in',
  '.co.in',
  '.io',
  '.ai',
  '.dev',
  '.app',
  '.tech',
  '.store',
  '.online',
  '.site',
  '.co',
];

interface DomainFinderSectionProps {
  onSelectDomainForForm?: (domain: string) => void;
}

export const DomainFinderSection: React.FC<DomainFinderSectionProps> = ({
  onSelectDomainForForm,
}) => {
  const navigate = useNavigate();

  // Search Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('SaaS');
  const [industryKeywords, setIndustryKeywords] = useState('');
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([
    '.com',
    '.io',
    '.in',
    '.tech',
  ]);
  const [suggestionCount, setSuggestionCount] = useState<number>(24);

  // Results State
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedName, setLastSearchedName] = useState('');
  const [godaddyStatus, setGodaddyStatus] = useState<GoDaddyStatusDTO | null>(null);
  const [godaddyConfigured, setGodaddyConfigured] = useState(false);
  const [godaddyMessage, setGodaddyMessage] = useState<string>('');

  // Favorites (Stored in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('weblets_domain_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters & Sorting ('all' | 'exact' | 'available' | 'taken' | 'favorites')
  const [statusFilter, setStatusFilter] = useState<'all' | 'exact' | 'available' | 'taken' | 'favorites'>('all');
  const [extensionFilter, setExtensionFilter] = useState<string>('all');
  const [lengthFilter, setLengthFilter] = useState<'all' | 'short' | 'medium'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'shortest' | 'alphabetical' | 'price_asc'>('recommended');

  // Copy Feedback
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  // Load GoDaddy API status on mount
  useEffect(() => {
    domainApi
      .getStatus()
      .then((res) => {
        if (res.data.success) {
          setGodaddyStatus(res.data.status);
          setGodaddyConfigured(true);
          setGodaddyMessage(res.data.status.message);
        }
      })
      .catch(() => {});
  }, []);

  // Update extension suggestions when business type changes
  const handleBusinessTypeChange = (type: BusinessType) => {
    setBusinessType(type);
    if (type === 'AI/Technology') {
      setSelectedExtensions(['.ai', '.tech', '.io', '.com']);
    } else if (type === 'E-commerce' || type === 'Fashion') {
      setSelectedExtensions(['.com', '.store', '.in', '.shop']);
    } else if (type === 'Agency') {
      setSelectedExtensions(['.com', '.in', '.agency', '.co', '.design']);
    } else if (type === 'SaaS' || type === 'Startup') {
      setSelectedExtensions(['.com', '.io', '.app', '.dev', '.co']);
    }
  };

  const toggleExtension = (ext: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext)
        ? prev.length > 1
          ? prev.filter((e) => e !== ext)
          : prev
        : [...prev, ext]
    );
  };

  const handleSelectAllRecommended = () => {
    setSelectedExtensions(['.com', '.in', '.io', '.ai', '.tech', '.app', '.store']);
  };

  // Perform Search
  const handleSearch = async (e?: React.FormEvent, customCount?: number) => {
    if (e) e.preventDefault();
    const queryName = businessName.trim() || 'esyus';

    setLoading(true);
    setHasSearched(true);
    setLastSearchedName(queryName);

    const keywordsArray = industryKeywords
      .split(/[, ]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 1);

    try {
      const res = await domainApi.search({
        businessName: queryName,
        businessType,
        keywords: keywordsArray,
        preferredExtensions: selectedExtensions,
        count: customCount || suggestionCount,
        checkLiveAvailability: true,
      });

      if (res.data.success) {
        setSuggestions(res.data.suggestions);
        setGodaddyConfigured(true);
        if (res.data.godaddyMessage) {
          setGodaddyMessage(res.data.godaddyMessage);
        }
      }
    } catch (err: any) {
      console.error('Failed to search domains:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate more suggestions
  const handleLoadMore = () => {
    const nextCount = Math.min(suggestionCount + 12, 60);
    setSuggestionCount(nextCount);
    handleSearch(undefined, nextCount);
  };

  // Toggle Favorite
  const toggleFavorite = (domain: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain];
      try {
        localStorage.setItem('weblets_domain_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Copy Domain Name
  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  // Copy All Favorites
  const handleCopyAllFavorites = () => {
    if (favorites.length === 0) return;
    navigator.clipboard.writeText(favorites.join('\n'));
    alert(`Copied ${favorites.length} saved domain names to clipboard!`);
  };

  // Pre-fill in Website Requirement Form
  const handleUseInForm = (domain: string) => {
    if (onSelectDomainForForm) {
      onSelectDomainForForm(domain);
    } else {
      navigate('/requirements/website', { state: { prefilledDomain: domain } });
    }
  };

  // Derived sets
  const exactMatchesList = useMemo(() => {
    return suggestions.filter((s) => s.category === 'exact');
  }, [suggestions]);

  const creativeVariationsList = useMemo(() => {
    return suggestions.filter((s) => s.category !== 'exact');
  }, [suggestions]);

  const availableCount = useMemo(() => {
    return suggestions.filter((s) => s.status === 'available').length;
  }, [suggestions]);

  const takenCount = useMemo(() => {
    return suggestions.filter((s) => s.status === 'unavailable').length;
  }, [suggestions]);

  // Filter & Sort Logic for full list
  const filteredSuggestions = useMemo(() => {
    let list = [...suggestions];

    // Status Filter
    if (statusFilter === 'exact') {
      list = list.filter((s) => s.category === 'exact');
    } else if (statusFilter === 'available') {
      list = list.filter((s) => s.status === 'available');
    } else if (statusFilter === 'taken') {
      list = list.filter((s) => s.status === 'unavailable');
    } else if (statusFilter === 'favorites') {
      list = list.filter((s) => favorites.includes(s.domain));
    }

    // Extension Filter
    if (extensionFilter !== 'all') {
      list = list.filter((s) => s.extension.toLowerCase() === extensionFilter.toLowerCase());
    }

    // Length Filter
    if (lengthFilter === 'short') {
      list = list.filter((s) => s.name.length < 8);
    } else if (lengthFilter === 'medium') {
      list = list.filter((s) => s.name.length >= 8 && s.name.length <= 12);
    }

    // Sorting
    if (sortBy === 'shortest') {
      list.sort((a, b) => a.name.length - b.name.length);
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.price ?? 99999) - (b.price ?? 99999));
    }

    return list;
  }, [suggestions, statusFilter, extensionFilter, lengthFilter, sortBy, favorites]);

  // Card component renderer for clean reuse
  const renderDomainCard = (item: DomainSuggestion, isExactSection = false) => {
    const isFavorite = favorites.includes(item.domain);
    const isCopied = copiedDomain === item.domain;
    const isAvailable = item.status === 'available';

    return (
      <div
        key={item.domain}
        className={`p-5 rounded-3xl glass-card flex flex-col justify-between group transition-all duration-200 relative overflow-hidden shadow-sm ${
          isAvailable
            ? 'border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 hover:shadow-lg'
            : 'border-slate-200/90 dark:border-charcoal-750/90 opacity-95 hover:border-slate-400'
        }`}
      >
        <div>
          {/* Top Header: Badge, Tag & Favorite */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              {item.category === 'exact' ? (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-brand-500" />
                  <span>EXACT MATCH</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                  {item.category.replace('_', ' ')}
                </span>
              )}

              {item.isRecommendedExtension && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                  Top Pick
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(item.domain)}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors app-press cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Domain Name with Extension Highlight */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-brand-500 transition-colors">
              {item.name}
            </span>
            <span className="text-lg sm:text-xl font-bold text-brand-500 font-mono">
              {item.extension}
            </span>
          </div>

          {/* Reason / Strategy description */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
            {item.reason}
          </p>

          {/* Real-Time Availability & Price Banner */}
          <div
            className={`my-2 p-3 rounded-2xl flex items-center justify-between border ${
              isAvailable
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/25'
                : 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/20'
            }`}
          >
            {/* Status Pill */}
            {isAvailable ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Available</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-black">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Taken / Registered</span>
              </div>
            )}

            {/* Price Details */}
            {isAvailable ? (
              <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono">
                {item.priceFormatted || 'Live GoDaddy Rate'}
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              type="button"
              onClick={() => handleCopy(item.domain)}
              title="Copy domain name"
              className="p-2 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors app-press cursor-pointer"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Use in Requirement Builder (Enabled when available or exact) */}
            {isAvailable ? (
              <button
                type="button"
                onClick={() => handleUseInForm(item.domain)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-charcoal-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 transition-colors app-press cursor-pointer flex items-center gap-1"
              >
                <span>Use in Form</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUseInForm(item.domain)}
                title="Use anyway as domain reference in your requirement specification"
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span>Use Name</span>
              </button>
            )}
          </div>

          {/* GoDaddy Official Action Button */}
          <a
            href={item.officialGoDaddyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all app-press cursor-pointer shadow-sm ${
              isAvailable
                ? 'bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-sm'
                : 'bg-slate-200 dark:bg-charcoal-800 hover:bg-slate-300 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{isAvailable ? 'Register' : 'Check'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section id="domain-finder" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
      {/* Background Decorative Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header & Value Proposition */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-4 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Real-time GoDaddy & Authoritative DNS Domain Intelligence</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Find Your Perfect{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500">
            Brandable Domain
          </span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Search your exact business name or discover creative brandable variations. Every domain is verified in real time as <strong>Available</strong> or <strong>Taken</strong> with live GoDaddy registration rates.
        </p>

        {/* GoDaddy Connection Status Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 text-slate-700 dark:text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
          <span>Live GoDaddy Pricing & Authoritative Registry DNS Active</span>
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
        </div>
      </div>

      {/* --- SMART SEARCH INPUT PANEL --- */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 mb-12 border border-slate-200/80 dark:border-charcoal-750/80 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Row 1: Business Name & Industry Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Business or Project Name <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. esyus, omniflow, swiftpulse..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-900/90 border border-slate-200 dark:border-charcoal-750 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm sm:text-base transition-all"
                />
                {businessName && (
                  <button
                    type="button"
                    onClick={() => setBusinessName('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Quick try:</span>
                {['esyus', 'OmniFlow', 'SwiftPulse', 'NovaScale'].map((sample) => (
                  <button
                    type="button"
                    key={sample}
                    onClick={() => setBusinessName(sample)}
                    className="text-brand-500 hover:underline font-semibold cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Industry or Keywords <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={industryKeywords}
                onChange={(e) => setIndustryKeywords(e.target.value)}
                placeholder="e.g. cloud, pay, studio, ai (comma-separated)"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-900/90 border border-slate-200 dark:border-charcoal-750 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm sm:text-base transition-all"
              />
              <span className="block mt-1 text-[11px] text-slate-400">
                Linguistic blends will pair these with your business root
              </span>
            </div>
          </div>

          {/* Row 2: Business Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5">
              Select Business Type <span className="text-slate-400 font-normal">(Tailors suffixes and recommendations)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleBusinessTypeChange(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer app-press ${
                    businessType === type
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Extensions Selector Chips */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Target Extensions ({selectedExtensions.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAllRecommended}
                className="text-xs text-brand-500 hover:underline font-bold cursor-pointer"
              >
                Reset to Recommended
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXTENSIONS.map((ext) => {
                const isSelected = selectedExtensions.includes(ext);
                return (
                  <button
                    type="button"
                    key={ext}
                    onClick={() => toggleExtension(ext)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer app-press ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {ext}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Trigger Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-brand transition-all cursor-pointer disabled:opacity-50 app-press"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Checking GoDaddy & Global Registry DNS...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Check Exact Name & Generate Domain Ideas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- RESULTS DASHBOARD & DUAL-SECTION DISPLAY --- */}
      {hasSearched && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Controls Bar: Filters & Sorting */}
          <div className="rounded-2xl glass-card p-4 border border-slate-200/90 dark:border-charcoal-750/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Found {suggestions.length} Domain Results for "{lastSearchedName}"</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact matches verified first • Live GoDaddy registration rates
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-charcoal-750 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All ({suggestions.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('exact')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'exact'
                      ? 'bg-white dark:bg-charcoal-750 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Star className="w-3 h-3 fill-brand-500 text-brand-500" />
                  <span>Exact ({exactMatchesList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('available')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'available'
                      ? 'bg-white dark:bg-charcoal-750 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span>Available ({availableCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('taken')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'taken'
                      ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <XCircle className="w-3 h-3 text-rose-500" />
                  <span>Taken ({takenCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('favorites')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    statusFilter === 'favorites'
                      ? 'bg-white dark:bg-charcoal-750 text-rose-500 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>Saved ({favorites.length})</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recommended">Best Recommended</option>
                <option value="shortest">Shortest Name</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="price_asc">Price (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Favorites Sticky Banner */}
          {favorites.length > 0 && statusFilter !== 'favorites' && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>
                  You have <strong>{favorites.length}</strong> saved domain favorite
                  {favorites.length > 1 ? 's' : ''}.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyAllFavorites}
                  className="font-bold underline hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
                >
                  Copy All Saved
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('favorites')}
                  className="font-bold px-3 py-1 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  View Favorites
                </button>
              </div>
            </div>
          )}

          {/* DUAL SECTION DISPLAY WHEN FILTER IS 'ALL' */}
          {statusFilter === 'all' ? (
            <div className="space-y-12">
              {/* SECTION A: EXACT NAME MATCHES (HIGHLIGHTED AT TOP) */}
              {exactMatchesList.length > 0 && (
                <div className="rounded-3xl p-6 sm:p-7 bg-brand-500/5 dark:bg-charcoal-900/60 border-2 border-brand-500/30 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-500/15 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-glow-sm">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          Exact Search Matches for "{lastSearchedName}"
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Direct domain extension checks with live availability status and GoDaddy prices
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 self-start sm:self-auto">
                      {exactMatchesList.length} Extensions Checked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exactMatchesList.map((item) => renderDomainCard(item, true))}
                  </div>
                </div>
              )}

              {/* SECTION B: CREATIVE AI VARIATIONS & ALTERNATIVES */}
              {creativeVariationsList.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        Creative AI Variations & Name Ideas
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Brandable suffixes, high-converting prefixes, and industry combinations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {creativeVariationsList.map((item) => renderDomainCard(item, false))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FILTERED GRID DISPLAY */
            <div>
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-16 rounded-3xl glass-card">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    No matching domains for this filter
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try switching filters back to 'All' or generate more suggestions.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white cursor-pointer app-press"
                  >
                    Reset to All Results
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSuggestions.map((item) => renderDomainCard(item))}
                </div>
              )}
            </div>
          )}

          {/* Load More Button */}
          {suggestions.length < 60 && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-800 dark:text-white transition-all cursor-pointer app-press shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Generate More Domain Combinations (+12)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
