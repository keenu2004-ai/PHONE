import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { QuickRequestModal } from '../modals/QuickRequestModal';
import { useUserStore } from '../../store/useUserStore';
import { useToast } from '../toast/ToastContext';
import { Building2, UserCheck, LogOut } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { currentUser, users, setCurrentUserId, logout } = useUserStore();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [isQuickRequestOpen, setIsQuickRequestOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('Signed out of session.', 'Logged Out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col md:flex-row">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-gray-900 tracking-tight">TeamNest</span>
        </div>

        {/* Mobile User Switcher & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <select
              value={currentUser?.id || ''}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer max-w-[100px] truncate"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name.split(' ')[0]} ({u.role[0]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[250px] p-4 md:p-8 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenQuickRequest={() => setIsQuickRequestOpen(true)} />

      {/* Quick Request Modal */}
      <QuickRequestModal
        isOpen={isQuickRequestOpen}
        onClose={() => setIsQuickRequestOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
