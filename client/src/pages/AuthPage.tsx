import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, RegisterSchema } from '@shared/schemas/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Lock, Mail, User, Building, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from || (user?.role === 'admin' || user?.role === 'superadmin' ? '/admin' : '/portal');

  // React Hook Form for Login
  const loginForm = useForm({
    resolver: zodResolver(LoginSchema as any),
    defaultValues: { email: '', password: '' },
  });

  // React Hook Form for Register
  const registerForm = useForm({
    resolver: zodResolver(RegisterSchema as any),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      company: '',
    },
  });

  const onLoginSubmit = async (values: any) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate(redirectPath);
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: any) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await registerUser(values);
      navigate('/portal');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-xl shadow-glow-sm mb-4">
            W
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Client Account'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isLogin
              ? 'Access your project requirements, status, and quotations'
              : 'Register to submit and track your web & app specifications'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-charcoal-750">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-charcoal-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setServerError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isLogin
                  ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setServerError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {serverError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* --- LOGIN FORM --- */}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {loginForm.formState.errors.email.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    {...loginForm.register('password')}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {loginForm.formState.errors.password.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white shadow-glow-sm hover:shadow-glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Credentials Quick-Fill helper */}
              <div className="pt-3 border-t border-slate-100 dark:border-charcoal-750 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                  Quick fill for testing:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginForm.setValue('email', 'admin@agency.com');
                      loginForm.setValue('password', 'Admin@Agency2026!');
                    }}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    Admin Demo
                  </button>
                  <span className="text-slate-300 dark:text-charcoal-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      loginForm.setValue('email', 'client@acmeretail.com');
                      loginForm.setValue('password', 'Client@Pass2026!');
                    }}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    Client Demo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* --- REGISTER FORM --- */
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    {...registerForm.register('fullName')}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                {registerForm.formState.errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {registerForm.formState.errors.fullName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    {...registerForm.register('email')}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {registerForm.formState.errors.email.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    {...registerForm.register('password')}
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {registerForm.formState.errors.password.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    {...registerForm.register('phone')}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    {...registerForm.register('company')}
                    placeholder="Acme Inc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white shadow-glow-sm hover:shadow-glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
