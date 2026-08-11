import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, Plus, CalendarDays, Receipt } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface BottomNavProps {
  onOpenQuickRequest: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickRequest }) => {
  const { currentUser } = useUserStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        {/* Attendance */}
        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span>Clock</span>
        </NavLink>

        {/* Center Quick Request Floating Plus Button */}
        <button
          onClick={onOpenQuickRequest}
          className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-600/30 -mt-6 border-4 border-white transition-transform active:scale-95"
          title="Quick Request Leave / Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Leaves */}
        <NavLink
          to="/leaves"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Leaves</span>
        </NavLink>

        {/* Expenses / Admin */}
        <NavLink
          to={currentUser?.role === 'ADMIN' ? '/admin' : '/expenses'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span>{currentUser?.role === 'ADMIN' ? 'Admin' : 'Expenses'}</span>
        </NavLink>
      </div>
    </div>
  );
};
