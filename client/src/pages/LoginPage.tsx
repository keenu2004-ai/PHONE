import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useToast } from '../components/toast/ToastContext';
import { Building2, Lock, Mail, ArrowRight, Shield, User, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useUserStore();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showError('Please enter your email address', 'Form Missing Required Fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      showSuccess('Session authenticated successfully!', 'Welcome Back');
      navigate(from, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Invalid login credentials', 'Authentication Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'password');
      showSuccess(`Logged in as ${roleName}!`, 'Demo Session Active');
      navigate(from, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sign in to TeamNest</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise Workforce Management Platform</p>
        </div>

        <div className="teamnest-card p-6 md:p-8 shadow-xl">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Seeded Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Instant Seeded Accounts
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@company.com', 'Admin User (ADMIN)')}
                className="w-full p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-brand-600" />
                  <div>
                    <div className="text-xs font-extrabold text-gray-900">Admin User</div>
                    <div className="text-[11px] text-gray-500">admin@company.com</div>
                  </div>
                </div>
                <span className="badge badge-admin text-[10px]">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@company.com', 'Alex Rivera (EMPLOYEE)')}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-extrabold text-gray-900">Alex Rivera</div>
                    <div className="text-[11px] text-gray-500">alex@company.com</div>
                  </div>
                </div>
                <span className="badge badge-employee text-[10px]">EMPLOYEE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
