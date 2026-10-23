import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Key, Check, X, Search, UserCheck } from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { UserDTO } from '@shared/types/index.js';
import { SYSTEM_PERMISSIONS, SystemPermission } from '@shared/constants/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Editing modal
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin' | 'superadmin'>('client');
  const [selectedPermissions, setSelectedPermissions] = useState<SystemPermission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    adminApi
      .getAllUsers()
      .then((res) => {
        if (res.data.success) setUsers(res.data.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEdit = (u: UserDTO) => {
    setEditingUser(u);
    setSelectedRole(u.role);
    setSelectedPermissions(u.permissions || []);
    setSelectedStatus(u.status);
  };

  const togglePermission = (perm: SystemPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        role: selectedRole,
        permissions: selectedPermissions,
        status: selectedStatus,
      });

      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            SECURITY & ACCESS GOVERNANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            User & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign role-based access control, grant sensitive financial permissions, and monitor client accounts.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading users...</div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-900/50 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Permissions Granted</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750 text-xs font-medium">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {u.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal">{u.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.role === 'superadmin'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === 'superadmin' ? (
                        <span className="text-[11px] text-purple-500 font-bold">
                          All Permissions (Superadmin)
                        </span>
                      ) : u.permissions && u.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions.map((p) => (
                            <span
                              key={p}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard Client (None)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-charcoal-800 hover:bg-brand-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit User Access: {editingUser.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{editingUser.email}</p>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
                  >
                    <option value="client">Client User</option>
                    <option value="admin">Administrator</option>
                    {currentUser?.role === 'superadmin' && (
                      <option value="superadmin">Superadministrator</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {selectedRole === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Granular Administrative Permissions:
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-100 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850">
                    {SYSTEM_PERMISSIONS.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm)}
                            className="rounded text-brand-500"
                          />
                          <span
                            className={
                              perm.includes('financials')
                                ? 'text-emerald-500 font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }
                          >
                            {perm}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-charcoal-750">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-sm"
                >
                  Save Access Rights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
