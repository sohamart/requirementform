import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { AddonDTO } from '@shared/types/index.js';
import { formatINR, toPaise, toRupees } from '@shared/utils/currency.js';

export const AdminAddonsPage: React.FC = () => {
  const [addons, setAddons] = useState<AddonDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Partial<AddonDTO> | null>(null);
  const [unitRupees, setUnitRupees] = useState('');

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = () => {
    setLoading(true);
    adminApi
      .getAllAddons()
      .then((res) => {
        if (res.data.success) setAddons(res.data.addons);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEdit = (addon: AddonDTO) => {
    const addonId = (addon as any).id || (addon as any)._id;
    setEditingAddon({
      ...addon,
      id: addonId,
      _id: addonId,
    } as any);
    setUnitRupees(String(toRupees(addon.unitPricePaise)));
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingAddon({
      slug: '',
      category: 'both',
      name: '',
      description: '',
      billingType: 'one_time',
      unitLabel: '',
      isActive: true,
      order: addons.length + 1,
    });
    setUnitRupees('1500');
    setShowModal(true);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon) return;

    const addonId = (editingAddon as any).id || (editingAddon as any)._id;
    const pricePaise = toPaise(parseFloat(unitRupees) || 0);
    const payload = {
      ...editingAddon,
      unitPricePaise: pricePaise,
    };

    try {
      if (addonId) {
        await adminApi.updateAddon(addonId, payload);
      } else {
        await adminApi.createAddon(payload);
      }
      setShowModal(false);
      loadAddons();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save addon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            OPTIONAL SERVICES & ADDONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Optional Services Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure supplementary digital services, recurring monthly maintenance, and per-unit expansion rates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading optional services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addons.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-750 text-slate-600 dark:text-slate-300">
                    {a.category} • {a.billingType.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{a.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
                  <span className="text-lg font-black text-brand-500">
                    {formatINR(a.unitPricePaise)}
                    {a.billingType === 'monthly' && <span className="text-xs font-normal">/mo</span>}
                    {a.billingType === 'per_unit' && a.unitLabel && (
                      <span className="text-xs font-normal">/{a.unitLabel}</span>
                    )}
                  </span>
                </div>
                <span className={a.isActive ? 'text-xs text-emerald-500 font-bold' : 'text-xs text-slate-400'}>
                  {a.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && editingAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingAddon.id ? 'Edit Service' : 'Add Optional Service'}
            </h3>

            <form onSubmit={handleSaveAddon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAddon.name || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
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
                  value={editingAddon.slug || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={editingAddon.description || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rate in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={unitRupees}
                    onChange={(e) => setUnitRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold text-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Mode
                  </label>
                  <select
                    value={editingAddon.billingType}
                    onChange={(e) =>
                      setEditingAddon({ ...editingAddon, billingType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs"
                  >
                    <option value="one_time">One-time</option>
                    <option value="monthly">Monthly Recurring</option>
                    <option value="per_unit">Per-Unit (page/screen)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-charcoal-750">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAddonActive"
                    checked={editingAddon.isActive}
                    onChange={(e) => setEditingAddon({ ...editingAddon, isActive: e.target.checked })}
                    className="rounded text-brand-500"
                  />
                  <label htmlFor="isAddonActive" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Active & Selectable
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
                    Save Service
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
