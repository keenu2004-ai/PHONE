import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { userApi, leaveApi, expenseApi, holidayApi } from '../services/api';
import { User, Leave, Expense, Holiday } from '../types';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { useToast } from '../components/toast/ToastContext';
import { exportWeeklyPayroll } from '../services/exportPayroll';
import {
  Clock,
  Users,
  Check,
  X,
  Plus,
  RefreshCw,
  Gift,
  ExternalLink,
  UserPlus,
  Receipt,
  CalendarDays,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'approvals' | 'team' | 'holidays'>('approvals');

  // Data states
  const [team, setTeam] = useState<User[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Modal state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Holiday Form State
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidaySubmitting, setHolidaySubmitting] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, leavesData, expensesData, holidaysData] = await Promise.all([
        userApi.getAll(),
        leaveApi.getAll(),
        expenseApi.getAll(),
        holidayApi.getAll(),
      ]);

      setTeam(usersData);
      setPendingLeaves(leavesData.filter((l) => l.status === 'PENDING'));
      setPendingExpenses(expensesData.filter((e) => e.status === 'PENDING'));
      setHolidays(holidaysData);
    } catch (err: any) {
      showError(err.message || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Export Weekly Payroll Feature
  const handleExportPayroll = async () => {
    setExporting(true);
    try {
      await exportWeeklyPayroll();
      showSuccess('Weekly Payroll report exported & downloaded as CSV!', 'Payroll Export Complete');
    } catch (err: any) {
      showError(err.message || 'Failed to generate payroll export', 'Export Error');
    } finally {
      setExporting(false);
    }
  };

  // Instant Approval Actions
  const handleApproveLeave = async (id: string) => {
    try {
      await leaveApi.updateStatus(id, 'APPROVED');
      showSuccess('Leave request approved successfully!', 'Leave Approved');
      await loadAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to approve leave');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await leaveApi.updateStatus(id, 'REJECTED');
      showSuccess('Leave request rejected.', 'Leave Rejected');
      await loadAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to reject leave');
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await expenseApi.updateStatus(id, 'APPROVED');
      showSuccess('Expense claim approved!', 'Expense Approved');
      await loadAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (id: string) => {
    try {
      await expenseApi.updateStatus(id, 'REJECTED');
      showSuccess('Expense claim rejected.', 'Expense Rejected');
      await loadAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to reject expense');
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim()) return;

    setHolidaySubmitting(true);
    try {
      await holidayApi.create({
        name: holidayName.trim(),
        date: new Date(holidayDate).toISOString(),
      });
      setHolidayName('');
      showSuccess('New company holiday added successfully!', 'Holiday Created');
      await loadAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to add holiday');
    } finally {
      setHolidaySubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Top Bar with Export Weekly Payroll Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Control Center</h1>
            <span className="badge badge-admin">Restricted View</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as <span className="font-bold text-gray-900">{currentUser?.full_name}</span> ({currentUser?.role})
          </p>
        </div>

        {/* Export Weekly Payroll Button */}
        <button
          onClick={handleExportPayroll}
          disabled={exporting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          {exporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>{exporting ? 'Generating CSV...' : 'Export Weekly Payroll'}</span>
        </button>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'approvals'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
            activeTab === 'approvals' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {pendingLeaves.length + pendingExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'team'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Directory</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
            activeTab === 'team' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          }`}>
            {team.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'holidays'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Holiday Manager</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
            activeTab === 'holidays' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
          }`}>
            {holidays.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: PENDING APPROVALS ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Leaves Section */}
          <div className="teamnest-card p-6">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-600" /> Leave Requests Awaiting Action
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full badge-pending font-bold">{pendingLeaves.length} Pending</span>
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="text-sm text-gray-400 py-6 text-center">No pending leave applications.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Comments</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {pendingLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={l.user?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-gray-900">{l.user?.full_name}</div>
                            <div className="text-xs text-gray-500">{l.user?.email}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-gray-800">{l.leave_type}</td>
                        <td className="p-3.5 text-xs text-gray-600 font-mono">
                          {new Date(l.start_date).toLocaleDateString()} &rarr; {new Date(l.end_date).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-xs text-gray-500 max-w-xs truncate">
                          {l.comments || <span className="text-gray-300 italic">None</span>}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveLeave(l.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectLeave(l.id)}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Expenses Section */}
          <div className="teamnest-card p-6">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-600" /> Expense Claims Awaiting Action
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full badge-pending font-bold">{pendingExpenses.length} Pending</span>
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : pendingExpenses.length === 0 ? (
              <div className="text-sm text-gray-400 py-6 text-center">No pending expense claims.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Receipt</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {pendingExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={e.user?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-gray-900">{e.user?.full_name}</div>
                            <div className="text-xs text-gray-500">{e.user?.email}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">{e.category}</td>
                        <td className="p-3.5 font-extrabold text-gray-900 font-mono">${e.amount.toFixed(2)}</td>
                        <td className="p-3.5 text-xs">
                          {e.receipt_url ? (
                            <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline font-semibold flex items-center gap-1">
                              View Receipt <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-300">None</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveExpense(e.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectExpense(e.id)}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: TEAM DIRECTORY ================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="teamnest-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Workforce Directory</h3>
                <p className="text-xs text-gray-500">All registered employees and administrator accounts ({team.length})</p>
              </div>
              <button
                onClick={() => setIsAddEmployeeOpen(true)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Add New Employee
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3.5 hover:border-brand-200 transition-all">
                  <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200" />
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-sm text-gray-900 truncate">{u.full_name}</div>
                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HOLIDAY MANAGER ================= */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          <div className="teamnest-card p-6">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" /> Add New Company Holiday
            </h3>

            <form onSubmit={handleCreateHoliday} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Labor Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={holidaySubmitting}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {holidaySubmitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>

          <div className="teamnest-card p-6">
            <h3 className="font-extrabold text-base text-gray-900 mb-4">Company Holidays ({holidays.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {holidays.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-700 font-mono">
                      {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="font-extrabold text-sm text-gray-900">{h.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onSuccess={() => {
          showSuccess('New employee onboarded successfully!', 'Directory Updated');
          loadAdminData();
        }}
      />
    </div>
  );
};
