import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  FileText,
  BookmarkCheck,
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
  const resultsContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSelectAllExtensions = () => {
    setSelectedExtensions([...POPULAR_EXTENSIONS]);
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

        // Smooth scroll to results container after a brief render delay
        setTimeout(() => {
          if (resultsContainerRef.current) {
            resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
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

  // Card component renderer for clean reuse with explicit, understandable buttons
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
          {/* Top Header: Badge, Tag & Bookmark Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
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
                  Top Extension
                </span>
              )}
            </div>

            {/* Favorite / Bookmark Button with Clear Visual Feedback */}
            <button
              type="button"
              onClick={() => toggleFavorite(item.domain)}
              title={isFavorite ? 'Remove from saved favorites' : 'Save to domain shortlist'}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all app-press cursor-pointer border ${
                isFavorite
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'bg-slate-100/80 dark:bg-charcoal-800 border-transparent text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Domain Name with Extension Highlight */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-brand-500 transition-colors break-all">
              {item.name}
            </span>
            <span className="text-lg sm:text-xl font-bold text-brand-500 font-mono shrink-0">
              {item.extension}
            </span>
          </div>

          {/* Strategy description */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
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
            {/* Status Indicator */}
            {isAvailable ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Available to Buy</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-black">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Taken / Registered</span>
              </div>
            )}

            {/* Price Details */}
            {isAvailable ? (
              <div className="text-right">
                <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono block leading-tight">
                  {item.priceFormatted || 'Live GoDaddy Rate'}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                  1st Year Rate
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Bar: Self-Explanatory Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-charcoal-750 flex flex-wrap items-center justify-between gap-2">
          {/* Action 1: Copy Name */}
          <button
            type="button"
            onClick={() => handleCopy(item.domain)}
            title="Copy domain name to clipboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors app-press cursor-pointer text-xs font-semibold"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Action 2: Apply Domain to Project Form */}
            {isAvailable ? (
              <button
                type="button"
                onClick={() => handleUseInForm(item.domain)}
                title="Start website requirement specification with this domain prefilled"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 dark:hover:text-white border border-brand-500/25 transition-all app-press cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use for Website</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUseInForm(item.domain)}
                title="If you already own this domain, use it in your website specification"
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-charcoal-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                <span>I Own This</span>
              </button>
            )}

            {/* Action 3: GoDaddy Purchase / Registry Check */}
            <a
              href={item.officialGoDaddyUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={isAvailable ? 'Proceed to official GoDaddy registration' : 'Check registry details on GoDaddy'}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all app-press cursor-pointer shadow-sm ${
                isAvailable
                  ? 'bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-sm'
                  : 'bg-slate-200 dark:bg-charcoal-800 hover:bg-slate-300 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{isAvailable ? 'Buy on GoDaddy' : 'View on GoDaddy'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="domain-finder"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative scroll-mt-24 sm:scroll-mt-28 pb-32 sm:pb-24"
    >
      {/* Background Decorative Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header & Value Proposition */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
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

        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Search your exact business name or discover creative brandable variations. Every domain is verified in real time as <strong>Available</strong> or <strong>Taken</strong> with live GoDaddy registration rates.
        </p>

        {/* GoDaddy Connection Status Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 text-slate-700 dark:text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
          <span>Live GoDaddy Pricing & Authoritative Registry DNS Active</span>
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
        </div>
      </div>

      {/* --- SMART SEARCH INPUT PANEL --- */}
      <div className="rounded-3xl glass-card p-5 sm:p-8 mb-12 border border-slate-200/80 dark:border-charcoal-750/80 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Row 1: Business Name & Industry Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Business or Project Name <span className="text-brand-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Step 1</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Stackyr, Esyus, SwiftPulse..."
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
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Click to test:</span>
                {['Stackyr', 'Esyus', 'OmniFlow', 'SwiftPulse'].map((sample) => (
                  <button
                    type="button"
                    key={sample}
                    onClick={() => setBusinessName(sample)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-charcoal-800 text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white font-semibold transition-all cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Industry or Keywords <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Extra Ideas</span>
              </div>
              <input
                type="text"
                value={industryKeywords}
                onChange={(e) => setIndustryKeywords(e.target.value)}
                placeholder="e.g. cloud, pay, studio, ai (comma-separated)"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-900/90 border border-slate-200 dark:border-charcoal-750 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm sm:text-base transition-all"
              />
              <span className="block mt-1 text-[11px] text-slate-400">
                Pairs these terms with your business name to generate unique brand variations
              </span>
            </div>
          </div>

          {/* Row 2: Business Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Select Business Category <span className="text-slate-400 font-normal">(Auto-suggests relevant TLDs & suffixes)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Step 2</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((type) => {
                const isSelected = businessType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleBusinessTypeChange(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer app-press flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-glow-sm ring-2 ring-brand-500/30'
                        : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Extensions Selector Chips */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Target Domain Extensions ({selectedExtensions.length} selected to check)
              </label>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllRecommended}
                  className="text-brand-500 hover:underline font-bold cursor-pointer"
                >
                  Reset Popular
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleSelectAllExtensions}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  Select All 12
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXTENSIONS.map((ext) => {
                const isSelected = selectedExtensions.includes(ext);
                return (
                  <button
                    type="button"
                    key={ext}
                    onClick={() => toggleExtension(ext)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer app-press flex items-center gap-1 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm ring-2 ring-brand-500/40'
                        : 'bg-slate-100 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3] text-brand-500" />}
                    <span>{ext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Trigger Button with Clear Action Description */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-brand transition-all cursor-pointer disabled:opacity-50 app-press text-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Checking GoDaddy & Global Registry DNS...</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 shrink-0" />
                    <span className="text-base sm:text-lg">Check Exact Name & Generate Domain Ideas</span>
                  </div>
                  <span className="text-xs font-medium text-white/90 sm:border-l sm:border-white/30 sm:pl-2.5">
                    Live GoDaddy Availability & Rates
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- RESULTS DASHBOARD & DUAL-SECTION DISPLAY --- */}
      {hasSearched && (
        <div
          ref={resultsContainerRef}
          className="space-y-8 animate-in fade-in duration-300 scroll-mt-24"
        >
          {/* Controls Bar: Filters & Sorting (With Non-Clipping Horizontal Scroll on Mobile) */}
          <div className="rounded-2xl glass-card p-4 sm:p-5 border border-slate-200/90 dark:border-charcoal-750/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Found {suggestions.length} Domain Results for "{lastSearchedName}"</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact matches verified first • Live GoDaddy registration rates
              </p>
            </div>

            {/* Filter Tabs & Sort Control */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              {/* Touch-Friendly Non-Clipping Horizontal Scroll Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto -mx-1 px-1 touch-pan-x whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({suggestions.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('exact')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    statusFilter === 'exact'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-brand-500'
                  }`}
                >
                  <Star className={`w-3 h-3 ${statusFilter === 'exact' ? 'fill-white' : 'fill-brand-500 text-brand-500'}`} />
                  <span>Exact ({exactMatchesList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('available')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    statusFilter === 'available'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Available ({availableCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('taken')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    statusFilter === 'taken'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  <span>Taken ({takenCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('favorites')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    statusFilter === 'favorites'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${statusFilter === 'favorites' ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                  <span>Saved ({favorites.length})</span>
                </button>
              </div>

              {/* Sort Selector with Explanatory Icon & Label */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Best Recommended</option>
                  <option value="shortest">Shortest Name</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  <option value="price_asc">Price (Low to High)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Favorites Banner */}
          {favorites.length > 0 && statusFilter !== 'favorites' && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>
                  You have <strong>{favorites.length}</strong> saved domain favorite
                  {favorites.length > 1 ? 's' : ''} in this session.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllFavorites}
                  className="font-bold underline hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer px-2 py-1"
                >
                  Copy All Saved Names
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('favorites')}
                  className="font-bold px-3 py-1 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  View Saved Shortlist
                </button>
              </div>
            </div>
          )}

          {/* DUAL SECTION DISPLAY WHEN FILTER IS 'ALL' */}
          {statusFilter === 'all' ? (
            <div className="space-y-10">
              {/* SECTION A: EXACT NAME MATCHES (HIGHLIGHTED AT TOP) */}
              {exactMatchesList.length > 0 && (
                <div className="rounded-3xl p-5 sm:p-7 bg-brand-500/5 dark:bg-charcoal-900/60 border-2 border-brand-500/30 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-500/15 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-glow-sm shrink-0">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          Exact Search Matches for "{lastSearchedName}"
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Direct domain extension checks with live GoDaddy pricing & registry status
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 self-start sm:self-auto shrink-0">
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
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
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
                    Try switching filters back to 'All Results' or generate more domain combinations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white cursor-pointer app-press shadow-sm"
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-850 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-800 dark:text-white transition-all cursor-pointer app-press shadow-sm"
              >
                <Plus className="w-4 h-4 text-brand-500" />
                <span>Generate 12 More Domain Ideas (+12)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
