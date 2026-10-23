import React, { useState, useEffect } from 'react';
import { Package as PackageIcon, Plus, Edit, CheckCircle, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { PackageDTO } from '@shared/types/index.js';
import { formatINR, toPaise, toRupees } from '@shared/utils/currency.js';

export const AdminPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Partial<PackageDTO> | null>(null);
  const [featuresRaw, setFeaturesRaw] = useState('');
  const [standardRupees, setStandardRupees] = useState('');
  const [offerRupees, setOfferRupees] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    setLoading(true);
    adminApi
      .getAllPackages()
      .then((res) => {
        if (res.data.success) setPackages(res.data.packages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEdit = (pkg: PackageDTO) => {
    const pkgId = (pkg as any).id || (pkg as any)._id;
    setEditingPkg({
      ...pkg,
      id: pkgId,
      _id: pkgId,
    } as any);
    setStandardRupees(String(toRupees(pkg.standardPricePaise)));
    setOfferRupees(String(toRupees(pkg.offerPricePaise)));
    setFeaturesRaw(pkg.features.join('\n'));
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingPkg({
      slug: '',
      category: 'website',
      name: '',
      description: '',
      pricingMode: 'fixed',
      billingFrequency: 'one_time',
      features: [],
      maxRevisions: 2,
      isActive: true,
      order: packages.length + 1,
    });
    setStandardRupees('9999');
    setOfferRupees('5999');
    setFeaturesRaw('');
    setShowModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    const pkgId = (editingPkg as any).id || (editingPkg as any)._id;
    const stdPaise = toPaise(parseFloat(standardRupees) || 0);
    const offPaise = toPaise(parseFloat(offerRupees) || 0);
    const featuresList = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...editingPkg,
      standardPricePaise: stdPaise,
      offerPricePaise: offPaise,
      features: featuresList,
    };

    try {
      if (pkgId) {
        await adminApi.updatePackage(pkgId, payload);
      } else {
        await adminApi.createPackage(payload);
      }
      setShowModal(false);
      loadPackages();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save package.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            PRICING CATALOGUE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Package & Pricing Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure standard rates, promotional offer prices, pricing modes, and deliverables scope.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading packages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-750 text-slate-600 dark:text-slate-300">
                    {pkg.category} • {pkg.pricingMode}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                  {pkg.description}
                </p>

                {/* Price Display */}
                <div className="my-4 p-3 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-750 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Offer Rate</span>
                    <span className="text-xl font-black text-brand-500">
                      {formatINR(pkg.offerPricePaise)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard</span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatINR(pkg.standardPricePaise)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {pkg.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-[11px] text-slate-400 pl-5">
                      +{pkg.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between text-xs text-slate-400">
                <span>Max Revisions: {pkg.maxRevisions}</span>
                <span className={pkg.isActive ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                  {pkg.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingPkg.id ? 'Edit Package' : 'Create New Package'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPkg.name || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPkg.slug || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={editingPkg.description || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pricing Mode
                  </label>
                  <select
                    value={editingPkg.pricingMode}
                    onChange={(e) =>
                      setEditingPkg({ ...editingPkg, pricingMode: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="starting_price">Starting Price</option>
                    <option value="manual_review">Manual Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingPkg.category}
                    onChange={(e) =>
                      setEditingPkg({ ...editingPkg, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  >
                    <option value="website">Website</option>
                    <option value="app">App</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Standard Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={standardRupees}
                    onChange={(e) => setStandardRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={offerRupees}
                    onChange={(e) => setOfferRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold text-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Features Included (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresRaw}
                  onChange={(e) => setFeaturesRaw(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingPkg.isActive}
                    onChange={(e) => setEditingPkg({ ...editingPkg, isActive: e.target.checked })}
                    className="rounded text-brand-500"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Package Active & Visible in Catalogue
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-sm"
                  >
                    Save Package
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
