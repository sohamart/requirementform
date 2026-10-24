import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  Key,
  Check,
  X,
  Search,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  TrendingUp,
  HardDrive,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { UserDTO } from '@shared/types/index.js';
import { SYSTEM_PERMISSIONS, SystemPermission } from '@shared/constants/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Editing access modal
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin' | 'superadmin'>('client');
  const [selectedPermissions, setSelectedPermissions] = useState<SystemPermission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [saving, setSaving] = useState(false);

  // Password change modal (Superadmin can change ANY user's password + their own password)
  const [passwordModalUser, setPasswordModalUser] = useState<UserDTO | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

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

  const handleOpenPasswordModal = (u: UserDTO) => {
    setPasswordModalUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPassword(false);
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    try {
      const res = await adminApi.changeUserPassword(passwordModalUser.id, newPassword);
      if (res.data.success) {
        setPasswordSuccess(res.data.message || 'Password updated successfully!');
        setTimeout(() => {
          setPasswordModalUser(null);
          setPasswordSuccess(null);
        }, 2200);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
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

  const isSuperadmin = currentUser?.role === 'superadmin';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
              SECURITY & ACCESS GOVERNANCE
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              SUPERADMIN PRIVILEGE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            User & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Super Administrator can reset passwords, assign roles, and manage granular permissions for any user account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Action: Superadmin Change Own Password */}
          {currentUser && (
            <button
              onClick={() => handleOpenPasswordModal(currentUser as any)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white shadow-glow-sm transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change My Password</span>
            </button>
          )}

          <div className="w-full sm:w-60 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <Key className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <span>Loading system accounts and security records...</span>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-900/50 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Permissions Granted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-center">Manage Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750 text-xs font-medium">
                {filtered.map((u) => {
                  const isSelf = currentUser?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-charcoal-850/50 transition-colors ${
                        isSelf ? 'bg-purple-500/5 dark:bg-purple-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5 font-bold">
                              <span>{u.fullName}</span>
                              {isSelf && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500 text-white font-bold">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
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
                          <span className="text-[11px] text-purple-500 font-bold flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Unrestricted Superadmin Access</span>
                          </span>
                        ) : u.role === 'admin' ? (
                          <div className="space-y-1.5 max-w-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {u.permissions?.includes('view_financials') ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Margin Granted</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-slate-400">
                                  🔒 Margin Hidden
                                </span>
                              )}

                              {u.permissions?.includes('manage_google_drive') || u.permissions?.includes('view_google_drive') ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  <span>Drive Granted</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-slate-400">
                                  🔒 Drive Hidden
                                </span>
                              )}
                            </div>
                            {u.permissions && u.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {u.permissions
                                  .filter(
                                    (p) =>
                                      p !== 'view_financials' &&
                                      p !== 'manage_financials' &&
                                      p !== 'view_google_drive' &&
                                      p !== 'manage_google_drive'
                                  )
                                  .map((p) => (
                                    <span
                                      key={p}
                                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300"
                                    >
                                      {p}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard Client (No Admin Rights)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Superadmin Change Password Button */}
                          {isSuperadmin && (
                            <button
                              onClick={() => handleOpenPasswordModal(u)}
                              title={isSelf ? 'Change my password' : `Change password for ${u.fullName}`}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSelf
                                  ? 'bg-purple-500 text-white shadow-sm hover:bg-purple-600'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>{isSelf ? 'My Password' : 'Password'}</span>
                            </button>
                          )}

                          {/* Edit Access & Role Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-charcoal-800 hover:bg-brand-500 hover:text-white transition-colors cursor-pointer"
                          >
                            Edit Access
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPERADMIN CHANGE PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl relative my-auto bg-white dark:bg-charcoal-900">
            {/* Close Button */}
            <button
              onClick={() => setPasswordModalUser(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {passwordModalUser.id === currentUser?.id
                    ? 'Change My Superadmin Password'
                    : `Change Password: ${passwordModalUser.fullName}`}
                </h3>
                <p className="text-[11px] text-slate-400">{passwordModalUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3 leading-relaxed">
              {passwordModalUser.id === currentUser?.id ? (
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  You are setting a new password for your own Superadmin master account.
                </span>
              ) : (
                <span>
                  As Superadmin, you can set a new password for this user directly. They will be able to log in with this new password immediately.
                </span>
              )}
            </p>

            {passwordError && (
              <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password:
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold focus:outline-none focus:border-purple-500 shadow-sm"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    {newPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title="Copy password"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        {copiedNotification ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-bold focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-charcoal-750">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white shadow-glow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl bg-white dark:bg-charcoal-900 overflow-hidden my-auto">
            {/* Header (Always Visible & Fixed at top) */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-charcoal-750 flex items-start justify-between shrink-0 bg-slate-50/60 dark:bg-charcoal-850/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit User Access: {editingUser.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="edit-user-form" onSubmit={handleSaveUser} className="overflow-y-auto p-6 space-y-4 flex-1">
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
                    {isSuperadmin && (
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
                <div className="space-y-3.5">
                  {/* Dedicated Highlight Box for Margin & Financial Access */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        Profit, Margin & Financial Access
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      As Super Administrator, grant this administrator permission to view and manage Profit & Margin and the In-Hand Calculator. If unchecked, this section is completely hidden from this admin.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer text-xs transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes('view_financials')}
                            onChange={() => togglePermission('view_financials')}
                            className="rounded text-emerald-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            view_financials
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          View financial dashboard and margins
                        </span>
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer text-xs transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes('manage_financials')}
                            onChange={() => togglePermission('manage_financials')}
                            className="rounded text-emerald-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            manage_financials
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Manage costs and partner split percentage
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Dedicated Highlight Box for Google Drive Cloud Storage Access */}
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                        Google Drive & Cloud Storage Access
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      As Super Administrator, grant this administrator access to view the Drive Hub and upload client project files/assets. <strong>No Google Cloud Console setup or email whitelisting is needed for them</strong> — the system uses centralized Google Drive storage.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer text-xs transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes('view_google_drive')}
                            onChange={() => togglePermission('view_google_drive')}
                            className="rounded text-blue-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            view_google_drive
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          Access Drive Hub and view project archives
                        </span>
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer text-xs transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes('manage_google_drive')}
                            onChange={() => togglePermission('manage_google_drive')}
                            className="rounded text-blue-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            manage_google_drive
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          1-Click bulk sync and upload project assets
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Other Administrative Permissions:
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-100 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850">
                      {SYSTEM_PERMISSIONS.filter(
                        (p) =>
                          p !== 'view_financials' &&
                          p !== 'manage_financials' &&
                          p !== 'view_google_drive' &&
                          p !== 'manage_google_drive'
                      ).map((perm) => {
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
                            <span className="text-slate-700 dark:text-slate-300">
                              {perm}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Footer (Always Visible & Fixed at bottom) */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-charcoal-750 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-charcoal-850/80">
              {isSuperadmin && (
                <button
                  type="button"
                  onClick={() => {
                    const target = editingUser;
                    setEditingUser(null);
                    handleOpenPasswordModal(target);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-user-form"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Access Rights'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
