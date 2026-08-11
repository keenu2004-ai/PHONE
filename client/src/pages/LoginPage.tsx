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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            <Building2 className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign in to TeamNest</h1>
          <p className="text-sm text-gray-700 font-extrabold mt-1">Enterprise Workforce Management Platform</p>
        </div>

        {/* Login Form Card */}
        <div className="teamnest-card p-6 md:p-8 shadow-xl">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-600">
                  <Mail className="w-4 h-4 stroke-[2.5]" />
                </div>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-extrabold text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-600">
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-extrabold text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Seeded Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600 stroke-[2.5]" /> Instant Seeded Accounts
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@company.com', 'Admin User (ADMIN)')}
                className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-700 stroke-[2.5]" />
                  <div>
                    <div className="text-xs font-black text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-700 font-bold">admin@company.com</div>
                  </div>
                </div>
                <span className="badge badge-admin text-[10px] px-2.5 py-0.5 rounded-full">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@company.com', 'Alex Rivera (EMPLOYEE)')}
                className="w-full p-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                  <div>
                    <div className="text-xs font-black text-gray-900">Alex Rivera</div>
                    <div className="text-xs text-gray-700 font-bold">alex@company.com</div>
                  </div>
                </div>
                <span className="badge badge-employee text-[10px] px-2.5 py-0.5 rounded-full">EMPLOYEE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
