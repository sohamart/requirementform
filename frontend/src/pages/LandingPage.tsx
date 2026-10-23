import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCheck,
  Code2,
  Server,
  Database,
  ExternalLink,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { publicApi } from '../services/api.js';
import { PackageDTO, AddonDTO } from '@shared/types/index.js';
import { formatINR } from '@shared/utils/currency.js';
import { DomainFinderSection } from '../components/domain/DomainFinderSection.js';
import { PackageDetailsModal } from '../components/common/PackageDetailsModal.js';

interface LandingPageProps {
  onOpenProjectSelector: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenProjectSelector }) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [addons, setAddons] = useState<AddonDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero interactive engine preview state ('website' | 'app' | 'desktop' | 'domains')
  const [activeEngine, setActiveEngine] = useState<'website' | 'app' | 'desktop' | 'domains'>('website');

  // Package category toggle (Websites default open first, app, desktop)
  const [projectCategory, setProjectCategory] = useState<'website' | 'app' | 'desktop'>('website');

  // Package sub-tier filter state
  const [packageCategory, setPackageCategory] = useState<'all' | 'starter' | 'pro'>('all');

  // Addon category filter state
  const [addonCategoryFilter, setAddonCategoryFilter] = useState<'all' | 'website' | 'app' | 'desktop'>('all');

  // Selected package for details popup modal
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<PackageDTO | null>(null);

  // Load packages whenever projectCategory changes (default: website)
  useEffect(() => {
    setLoading(true);
    publicApi
      .getPackages(projectCategory)
      .then((packRes) => {
        if (packRes.data.success) setPackages(packRes.data.packages);
      })
      .catch((err) => console.error('Failed to load packages:', err))
      .finally(() => setLoading(false));
  }, [projectCategory]);

  // Load all modular add-ons once
  useEffect(() => {
    publicApi
      .getAddons()
      .then((addonRes) => {
        if (addonRes.data.success) setAddons(addonRes.data.addons);
      })
      .catch((err) => console.error('Failed to load add-ons:', err));
  }, []);

  // Active Category Packages (Strictly filtered by current projectCategory)
  const activeCategoryPackages = useMemo(() => {
    return packages.filter((pkg) => !pkg.category || pkg.category === projectCategory);
  }, [packages, projectCategory]);

  // Sub-tier Filtered packages (all / starter / pro)
  const filteredPackages = useMemo(() => {
    return activeCategoryPackages.filter((pkg) => {
      if (packageCategory === 'starter') return pkg.offerPricePaise <= 1500000; // <= ₹15,000
      if (packageCategory === 'pro') return pkg.offerPricePaise > 1500000;
      return true;
    });
  }, [activeCategoryPackages, packageCategory]);

  // Filtered addons
  const filteredAddons = addons.filter((a) => {
    if (addonCategoryFilter === 'all') return true;
    return a.category === addonCategoryFilter || a.category === 'both' || a.category === 'all';
  });

  return (
    <div className="relative overflow-hidden bg-tech-grid">
      {/* Background Radiant Lighting Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-brand-500/15 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-64 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================
          1. HERO SECTION & INTERACTIVE ENGINE WORKSPACE
          ======================================================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Top Feature Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-charcoal-900/80 border border-slate-200/90 dark:border-charcoal-750/90 shadow-sm backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-brand-500 pulse-glow" />
            <span className="text-slate-800 dark:text-slate-200">
              Interactive Requirement Builder & Instant Quotation Suite
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold uppercase">
              v2.4
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] sm:leading-[1.12]">
            Precision Digital Engineering.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500">
              Instant Transparent Proposals.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Specify your website or mobile application requirements step-by-step. Get an itemized scope breakdown, live GoDaddy domain availability, private costing notes, and official downloadable quotation.
          </p>

          {/* Quick CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => onOpenProjectSelector()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-brand transition-all app-press cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Requirement Builder</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <a
              href="#domain-finder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm sm:text-base border border-slate-300/90 dark:border-charcoal-750/90 bg-white/60 dark:bg-charcoal-850/60 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-800 dark:text-white transition-all app-press cursor-pointer shadow-sm"
            >
              <Globe className="w-4 h-4 text-brand-500" />
              <span>Smart Domain Finder</span>
            </a>
          </div>
        </div>

        {/* ========================================================
            INTERACTIVE WEB APP WORKSPACE PREVIEW CARD
            ======================================================== */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="rounded-3xl glass-card border border-slate-200/90 dark:border-charcoal-750/90 shadow-2xl p-4 sm:p-7 overflow-hidden relative radiant-card-glow">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-charcoal-750">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 ml-2">
                  weblets.studio // scope-engine
                </span>
              </div>

              {/* Interactive Engine Switcher Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-charcoal-900 border border-slate-200/80 dark:border-charcoal-750/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveEngine('website')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeEngine === 'website'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website Engine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEngine('app')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeEngine === 'app'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile App Engine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEngine('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeEngine === 'desktop'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop Software</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEngine('domains')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeEngine === 'domains'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Domain AI</span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Based on Active Engine */}
            {activeEngine === 'website' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>8-Step Dynamic Requirement Form</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Full-Stack Web Engineering Specification
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Define project objectives, target audience, UI aesthetics, content structures, CMS preferences, and payment gateways with live pricing updates.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Next.js / Vite / React Architecture</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Ultra-Fast Responsive UI/UX</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Free SSL & Cloud CDN Setup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>GST-Compliant Official Proposal</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/requirements/website')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm transition-all app-press cursor-pointer"
                    >
                      <span>Launch Website Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 dark:bg-charcoal-950 p-5 rounded-2xl border border-slate-200/80 dark:border-charcoal-750/80 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Starting Investment</span>
                    <span className="font-extrabold text-brand-500 text-base">₹4,999</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Average Turnaround</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">5 – 10 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Direct Cost Breakdown</span>
                    <span className="font-bold text-emerald-500">100% Itemized</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-1">
                      TECH STACK DEPLOYED
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'TypeScript', 'Node.js', 'Tailwind', 'MongoDB', 'Vercel'].map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEngine === 'app' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>7-Step Mobile App Scoping System</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    iOS, Android & Cross-Platform Engineering
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Map user journeys, authentication flows, offline capabilities, push notifications, native sensor access, and backend API requirements.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>Flutter / React Native Hybrid</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>Google Play & App Store Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>Screen-Level Architecture Scope</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>Scalable Microservice Backend</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/requirements/app')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all app-press cursor-pointer"
                    >
                      <span>Launch App Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 dark:bg-charcoal-950 p-5 rounded-2xl border border-slate-200/80 dark:border-charcoal-750/80 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Starting Investment</span>
                    <span className="font-extrabold text-blue-500 text-base">₹24,999</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Average Turnaround</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">15 – 30 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">App Store Deployment</span>
                    <span className="font-bold text-emerald-500">Included Support</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-1">
                      MOBILE STACK SUPPORT
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Flutter', 'React Native', 'Kotlin', 'Swift', 'Firebase', 'Express'].map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEngine === 'desktop' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>8-Step Desktop Software Specification</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Offline-First Desktop & Enterprise Suite
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Custom billing software, POS systems, inventory management, offline encrypted databases, and multi-platform native desktop suites.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Windows, macOS & Linux</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Hardware & Thermal Printer Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Local Encrypted SQLite / PostgreSQL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Code-Signed Installer (.exe / .msi)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/requirements/desktop')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-glow-sm transition-all app-press cursor-pointer"
                    >
                      <span>Launch Desktop Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 dark:bg-charcoal-950 p-5 rounded-2xl border border-slate-200/80 dark:border-charcoal-750/80 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Starting Investment</span>
                    <span className="font-extrabold text-purple-500 text-base">₹14,999</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Average Turnaround</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">7 – 20 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Offline Functionality</span>
                    <span className="font-bold text-emerald-500">Zero Internet Required</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-1">
                      DESKTOP STACK SUPPORT
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Electron', 'Tauri', 'C# / WPF', 'C++', 'Python / Qt', 'SQLite'].map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-purple-600 dark:text-purple-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEngine === 'domains' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-time GoDaddy DNS Intelligence</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Smart Brandable Domain Discovery
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Generate creative, memorable domain names across .com, .in, .tech, .io, .online, and .app with instant live registrar verification.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Multi-TLD Parallel Checking</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Estimated Registrar Pricing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>One-Click Scope Auto-Fill</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>DNS & Cloudflare Support</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="#domain-finder"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all app-press cursor-pointer"
                    >
                      <span>Search Live Domains Below</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 dark:bg-charcoal-950 p-5 rounded-2xl border border-slate-200/80 dark:border-charcoal-750/80 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">GoDaddy Integration</span>
                    <span className="font-bold text-emerald-500">Live API Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Supported TLDs</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">12 Extensions</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-charcoal-800">
                    <span className="text-slate-500">Search Speed</span>
                    <span className="font-bold text-brand-500">&lt; 350ms</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-1">
                      POPULAR EXTENSIONS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['.com', '.in', '.dev', '.app', '.io', '.tech', '.co.in'].map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-emerald-600 dark:text-emerald-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4 Key Platform Value Pillars (Web App Ticker) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-2xl glass-card flex flex-col gap-1.5 border border-slate-200/70 dark:border-charcoal-750/70">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Instant PDF Scoping
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Detailed step answers & official formatted proposal
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card flex flex-col gap-1.5 border border-slate-200/70 dark:border-charcoal-750/70">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              100% IP & Code
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Full copyright, source repository, and asset handover
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card flex flex-col gap-1.5 border border-slate-200/70 dark:border-charcoal-750/70">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Domain Intelligence
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Direct GoDaddy API availability & rate calculation
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card flex flex-col gap-1.5 border border-slate-200/70 dark:border-charcoal-750/70">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Agile Milestone Sprints
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Verified delivery timelines & dedicated project notes
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. AI-POWERED SMART DOMAIN FINDER SECTION
          ======================================================== */}
      <DomainFinderSection
        onSelectDomainForForm={(domain) =>
          navigate('/requirements/website', { state: { prefilledDomain: domain } })
        }
      />

      {/* ========================================================
          3. PACKAGES & PRICING CATALOGUE
          ======================================================== */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 dark:border-charcoal-750/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Standard & Offer Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Pre-Configured Development Packages
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Transparent scope, guaranteed delivery turnaround, and clear revision guidelines. Select any tier to pre-configure your requirement form.
          </p>

          {/* Primary 3-Way Project Category Toggle (Websites Default Open First) */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setProjectCategory('website');
                setPackageCategory('all');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                projectCategory === 'website'
                  ? 'bg-brand-500 text-white shadow-glow-sm ring-2 ring-brand-500/20'
                  : 'bg-white dark:bg-charcoal-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-750 hover:bg-slate-50 dark:hover:bg-charcoal-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Websites & Portals</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProjectCategory('app');
                setPackageCategory('all');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                projectCategory === 'app'
                  ? 'bg-blue-600 text-white shadow-glow-sm ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-charcoal-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-750 hover:bg-slate-50 dark:hover:bg-charcoal-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile Apps</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProjectCategory('desktop');
                setPackageCategory('all');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                projectCategory === 'desktop'
                  ? 'bg-purple-600 text-white shadow-glow-sm ring-2 ring-purple-500/20'
                  : 'bg-white dark:bg-charcoal-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-750 hover:bg-slate-50 dark:hover:bg-charcoal-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop Software</span>
            </button>
          </div>

          {/* Sub-tier Filter Pills */}
          <div className="mt-4 inline-flex p-1 rounded-xl bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
            <button
              onClick={() => setPackageCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                packageCategory === 'all'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Packages ({activeCategoryPackages.length})
            </button>
            <button
              onClick={() => setPackageCategory('starter')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                packageCategory === 'starter'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Essential & Starter
            </button>
            <button
              onClick={() => setPackageCategory('pro')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                packageCategory === 'pro'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Business & Pro Tier
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <span className="text-sm">Loading package catalogue...</span>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl glass-card border border-slate-200/60 dark:border-charcoal-750/60 max-w-lg mx-auto">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No packages found in this specific tier.
            </p>
            <button
              onClick={() => setPackageCategory('all')}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white cursor-pointer hover:bg-brand-600 transition-colors shadow-sm"
            >
              View All {activeCategoryPackages.length} {projectCategory === 'website' ? 'Website' : projectCategory === 'app' ? 'Mobile App' : 'Desktop'} Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPackages.map((pkg, idx) => {
              const hasDiscount = pkg.standardPricePaise > pkg.offerPricePaise;
              const savings = hasDiscount ? pkg.standardPricePaise - pkg.offerPricePaise : 0;
              const isFeatured = idx === 1; // Highlight second tier as most popular
              const hasDomainOrHosting = pkg.features.some(
                (f) =>
                  f.toLowerCase().includes('1st year') ||
                  f.toLowerCase().includes('domain') ||
                  f.toLowerCase().includes('hosting')
              );

              return (
                <div
                  key={pkg.id || pkg.slug}
                  className={`flex flex-col justify-between rounded-3xl glass-card p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isFeatured
                      ? 'border-brand-500/80 dark:border-brand-500/80 ring-1 ring-brand-500/30 shadow-md'
                      : 'border-slate-200/80 dark:border-charcoal-750/80'
                  }`}
                >
                  {/* Subtle top edge ambient reflection line */}
                  {isFeatured ? (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent pointer-events-none" />
                  ) : hasDomainOrHosting ? (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent pointer-events-none" />
                  ) : null}

                  {/* Top Executive Badge Row (Guarantees exact same card height & single-line typography) */}
                  <div className="flex items-center justify-between gap-1.5 h-7 mb-3.5">
                    {/* Left Tag: Tier / Feature Highlight */}
                    {hasDomainOrHosting ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight bg-gradient-to-r from-emerald-500/12 via-teal-500/10 to-emerald-500/12 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/30 shadow-[0_2px_8px_rgba(16,185,129,0.12)] whitespace-nowrap">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>1st Yr Domain & Host</span>
                      </span>
                    ) : isFeatured ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight bg-gradient-to-r from-amber-500/15 via-brand-500/15 to-orange-500/15 dark:from-amber-950/60 dark:via-brand-950/50 dark:to-orange-950/50 text-brand-600 dark:text-brand-400 border border-brand-500/35 dark:border-brand-400/35 shadow-[0_2px_8px_rgba(255,107,0,0.12)] whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-brand-500 shrink-0" />
                        <span>Popular Choice</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100/90 dark:bg-charcoal-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-charcoal-750 shadow-2xs whitespace-nowrap">
                        <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>
                          {pkg.category === 'desktop'
                            ? 'Desktop Software'
                            : pkg.category === 'app'
                            ? 'Mobile App'
                            : 'Website Tier'}
                        </span>
                      </span>
                    )}

                    {/* Right Tag: High-Value Savings Badge */}
                    {hasDiscount && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-tight bg-gradient-to-r from-emerald-500/15 via-teal-500/12 to-emerald-500/15 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 dark:border-emerald-400/35 shadow-[0_2px_8px_rgba(16,185,129,0.10)] whitespace-nowrap shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>Save {formatINR(savings)}</span>
                      </span>
                    )}
                  </div>

                  {/* Header & Description */}
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {pkg.name}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-9 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Minimal Price Box */}
                    <div className="my-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-charcoal-850/80 border border-slate-100 dark:border-charcoal-750 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-brand-500">
                          {formatINR(pkg.offerPricePaise)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatINR(pkg.standardPricePaise)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {pkg.billingFrequency === 'monthly' ? '/month' : 'one-time'}
                      </span>
                    </div>
                  </div>

                  {/* Key Features (Exact 4 items for uniform card height) */}
                  <div className="flex-1 my-1">
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {pkg.features.slice(0, 4).map((feat, i) => {
                        const isSpecial =
                          feat.toLowerCase().includes('1st year') ||
                          feat.toLowerCase().includes('domain') ||
                          feat.toLowerCase().includes('hosting');

                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-2 line-clamp-1 ${
                              isSpecial ? 'font-medium text-emerald-600 dark:text-emerald-400' : ''
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                                isSpecial ? 'text-emerald-500' : 'text-brand-500'
                              }`}
                            />
                            <span className="truncate">{feat}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* "View all benefits" trigger that opens the popup modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedPackageForModal(pkg)}
                      className="mt-3.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group/btn cursor-pointer py-0.5"
                    >
                      <span>View all {pkg.features.length} benefits & details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-3 border-t border-slate-100 dark:border-charcoal-750/70 mt-2">
                    <button
                      onClick={() => navigate(`/requirements/${pkg.category || projectCategory}?package=${pkg.slug}`)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center app-press ${
                        isFeatured
                          ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm'
                          : 'bg-slate-900 dark:bg-charcoal-800 hover:bg-brand-500 dark:hover:bg-brand-500 text-white'
                      }`}
                    >
                      Select & Customize
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Package Details Popup Modal */}
        <PackageDetailsModal
          packageItem={selectedPackageForModal}
          onClose={() => setSelectedPackageForModal(null)}
          onSelect={(selectedPkg) => {
            setSelectedPackageForModal(null);
            navigate(`/requirements/${selectedPkg.category || projectCategory}?package=${selectedPkg.slug}`);
          }}
        />
      </section>

      {/* ========================================================
          4. MODULAR ADD-ONS & ENHANCEMENTS
          ======================================================== */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 dark:border-charcoal-750/80 bg-slate-50/40 dark:bg-charcoal-900/30">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modular Enhancements</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Optional Add-on Services & Upgrades
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Tailor your digital deliverable with dedicated SEO, thermal printer drivers, code signing, domain setups, and accelerated delivery.
          </p>

          {/* Add-on Category Filter Pills */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-750">
            <button
              onClick={() => setAddonCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addonCategoryFilter === 'all'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Add-ons ({addons.length})
            </button>
            <button
              onClick={() => setAddonCategoryFilter('website')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addonCategoryFilter === 'website'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Web Solutions
            </button>
            <button
              onClick={() => setAddonCategoryFilter('app')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addonCategoryFilter === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mobile Apps
            </button>
            <button
              onClick={() => setAddonCategoryFilter('desktop')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addonCategoryFilter === 'desktop'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Desktop Software
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddons.map((addon) => (
            <div
              key={addon.id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between hover:border-brand-500/50 transition-all duration-200 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {addon.name}
                  </h4>
                  <span className="text-sm font-extrabold text-brand-500">
                    {formatINR(addon.unitPricePaise)}
                    {addon.billingType === 'monthly' && (
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    )}
                    {addon.billingType === 'per_unit' && addon.unitLabel && (
                      <span className="text-xs font-normal text-slate-400">/{addon.unitLabel}</span>
                    )}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {addon.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                    {addon.billingType.replace('_', ' ')}
                  </span>
                  <span className="capitalize font-mono text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {addon.category}
                  </span>
                </div>
                <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Toggle in Form
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. AGILE 4-STEP ENGINEERING WORKFLOW ROADMAP
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 dark:border-charcoal-750/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Delivery Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How The Weblets Engineering Engine Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From preliminary scoping questions to live production deployment with complete transparency at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden border border-slate-200/90 dark:border-charcoal-750/90">
            <span className="text-3xl font-black text-brand-500/20 dark:text-brand-500/25 absolute top-4 right-4">
              01
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              1. Dynamic Scoping
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Answer tailored questions regarding UI design, feature sets, database models, and target domain names.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card relative overflow-hidden border border-slate-200/90 dark:border-charcoal-750/90">
            <span className="text-3xl font-black text-brand-500/20 dark:text-brand-500/25 absolute top-4 right-4">
              02
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              2. Instant Proposal PDF
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our automated system compiles your answers into an itemized Requirement Details document and official quotation.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card relative overflow-hidden border border-slate-200/90 dark:border-charcoal-750/90">
            <span className="text-3xl font-black text-brand-500/20 dark:text-brand-500/25 absolute top-4 right-4">
              03
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              3. Sprint Development
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our team develops the application in focused sprints with regular progress staging and direct developer communication.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card relative overflow-hidden border border-slate-200/90 dark:border-charcoal-750/90">
            <span className="text-3xl font-black text-brand-500/20 dark:text-brand-500/25 absolute top-4 right-4">
              04
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              4. Launch & IP Transfer
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Production deployment, DNS mapping, SSL certification, full source code delivery, and 30-day post-launch warranty.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. MODERN CALL TO ACTION BANNER
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-charcoal-900 border border-charcoal-750 p-8 sm:p-14 text-center overflow-hidden shadow-2xl radiant-card-glow">
          <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready To Begin?</span>
            </div>

            <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto tracking-tight">
              Start Building Your Digital Product Specification Today
            </h3>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Fill out the interactive form in 10 minutes, receive automated price calculations, and download your client-ready proposal immediately.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenProjectSelector}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-glow-brand transition-all cursor-pointer app-press"
              >
                <span>Launch Interactive Builder</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base border border-charcoal-700 bg-charcoal-850/70 hover:bg-charcoal-800 text-white transition-all cursor-pointer app-press"
              >
                <span>Client Portal Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
