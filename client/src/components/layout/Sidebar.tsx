import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { useToast } from '../toast/ToastContext';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Receipt,
  Shield,
  Building2,
  ChevronDown,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, users, setCurrentUserId, logout } = useUserStore();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showSuccess('Signed out of active session.', 'Logged Out');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/leaves', label: 'Leaves', icon: CalendarDays },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[250px] bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 tracking-tight leading-tight">TeamNest</h1>
            <p className="text-xs text-gray-500 font-medium">Workforce OS</p>
          </div>
        </div>
      </div>

      {/* User Context Switcher */}
      <div className="p-4 mx-4 my-4 bg-gray-50 rounded-xl border border-gray-200/80">
        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
          Active Employee
        </div>
        <div className="flex items-center gap-2.5">
          {currentUser && (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-600/20"
            />
          )}
          <div className="flex-1 min-w-0">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer truncate"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-gray-500 truncate">
              {currentUser?.email}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          // Strictly render /admin only if role === 'ADMIN'
          if (item.adminOnly && currentUser?.role !== 'ADMIN') {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border border-brand-100 shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Role & Logout Action */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Session Role</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
            currentUser?.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'
          }`}>
            {currentUser?.role || 'EMPLOYEE'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
