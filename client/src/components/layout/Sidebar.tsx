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
    <aside className="hidden md:flex flex-col w-[250px] bg-white border-r border-gray-300 h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <Building2 className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight leading-none">TeamNest</h1>
            <p className="text-xs font-bold text-blue-700 tracking-wide mt-1">Workforce OS</p>
          </div>
        </div>
      </div>

      {/* User Context Switcher Card */}
      <div className="p-3.5 mx-3.5 my-4 bg-gray-100/90 rounded-xl border border-gray-300">
        <div className="text-[11px] uppercase tracking-wider font-black text-gray-700 mb-1.5">
          Active Employee
        </div>
        <div className="flex items-center gap-2.5">
          {currentUser && (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full text-xs font-extrabold text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer truncate"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-gray-700 font-bold truncate">
              {currentUser?.email}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-700 shrink-0 stroke-[2.5]" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-black text-gray-700 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          if (item.adminOnly && currentUser?.role !== 'ADMIN') {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-colors stroke-[2.5] ${isActive ? 'text-white' : 'text-gray-700'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Role & Logout Action */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-bold">Session Role</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
            currentUser?.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'
          }`}>
            {currentUser?.role || 'EMPLOYEE'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 border border-gray-300 hover:border-red-300 rounded-xl text-xs font-black transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
