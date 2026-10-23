import React, { useState, useEffect } from 'react';
import { Palette, Plus, Edit, Star, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { BrandProfileDTO } from '@shared/types/index.js';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandProfileDTO> | null>(null);
  const [addressRaw, setAddressRaw] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    setLoading(true);
    adminApi
      .getAllBrands()
      .then((res) => {
        if (res.data.success) setBrands(res.data.brands);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEdit = (b: BrandProfileDTO) => {
    const brandId = (b as any).id || (b as any)._id;
    setEditingBrand({
      ...b,
      id: brandId,
      _id: brandId,
    } as any);
    setAddressRaw(b.addressLines?.join('\n') || '');
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingBrand({
      name: '',
      tagline: '',
      logoText: '',
      primaryColor: '#FF6B00',
      secondaryColor: '#121216',
      contactEmail: 'contact@agency.com',
      contactPhone: '+91 98765 00000',
      websiteUrl: 'https://agency.com',
      addressLines: [],
      isDefault: false,
      isActive: true,
    });
    setAddressRaw('');
    setShowModal(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    const payload = {
      ...editingBrand,
      addressLines: addressRaw.split('\n').map((a) => a.trim()).filter(Boolean),
    };

    const brandId = (editingBrand as any).id || (editingBrand as any)._id;

    try {
      if (brandId) {
        await adminApi.updateBrand(brandId, payload);
      } else {
        await adminApi.createBrand(payload);
      }

      // If marked as default or only brand exists, update local storage and notify Navbar immediately
      if (payload.isDefault || brands.length <= 1) {
        const brandTitle = payload.name || payload.logoText || 'WEBLETS';
        localStorage.setItem('weblets_brand_name', brandTitle);
        window.dispatchEvent(new CustomEvent('brand_updated', { detail: brandTitle }));
      }

      setShowModal(false);
      loadBrands();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save brand.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            BUSINESS IDENTITIES & TEMPLATES
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Brand Profiles & Document Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic commercial brand identities, logos, color tokens, and contact headers used across PDF proposals.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Profile</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading brand profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className={`p-6 rounded-3xl glass-card flex flex-col justify-between border-2 transition-all ${
                b.isDefault
                  ? 'border-brand-500 shadow-glow-sm'
                  : 'border-slate-200 dark:border-charcoal-750'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
                    style={{ backgroundColor: b.primaryColor }}
                  >
                    {b.name.charAt(0)}
                  </div>

                  <div className="flex items-center gap-2">
                    {b.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Default</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{b.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.tagline}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-750 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="text-slate-400">Email:</span> {b.contactEmail}
                  </p>
                  <p>
                    <span className="text-slate-400">Phone:</span> {b.contactPhone}
                  </p>
                  <p>
                    <span className="text-slate-400">Website:</span> {b.websiteUrl}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-white dark:border-charcoal-900 shadow-sm"
                    style={{ backgroundColor: b.primaryColor }}
                  />
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {b.primaryColor}
                  </span>
                </div>
                <span className={b.isActive ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                  {b.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {(editingBrand as any).id || (editingBrand as any)._id ? 'Edit Brand Profile' : 'Create Brand Profile'}
            </h3>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrand.name || ''}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setEditingBrand((prev) => {
                        if (!prev) return null;
                        const prevName = prev.name || '';
                        const shouldSyncLogo = !prev.logoText || prev.logoText === prevName || prev.logoText === prevName.toUpperCase();
                        return {
                          ...prev,
                          name: newName,
                          logoText: shouldSyncLogo ? newName.toUpperCase() : prev.logoText,
                        };
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Logo Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrand.logoText || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logoText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Proposal Header
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.tagline || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Brand Color (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingBrand.primaryColor || '#FF6B00'}
                      onChange={(e) =>
                        setEditingBrand({ ...editingBrand, primaryColor: e.target.value })
                      }
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingBrand.primaryColor || '#FF6B00'}
                      onChange={(e) =>
                        setEditingBrand({ ...editingBrand, primaryColor: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrand.contactPhone || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingBrand.contactEmail || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={editingBrand.websiteUrl || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address Lines (One per line)
                </label>
                <textarea
                  rows={2}
                  value={addressRaw}
                  onChange={(e) => setAddressRaw(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultBrand"
                    checked={editingBrand.isDefault}
                    onChange={(e) => setEditingBrand({ ...editingBrand, isDefault: e.target.checked })}
                    className="rounded text-brand-500"
                  />
                  <label htmlFor="isDefaultBrand" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Set as Default Identity
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
                    Save Brand
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
