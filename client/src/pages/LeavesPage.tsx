import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { leaveApi } from '../services/api';
import { Leave } from '../types';
import { useToast } from '../components/toast/ToastContext';
import { CalendarDays, Plus, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react';

export const LeavesPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [leaveType, setLeaveType] = useState('Sick');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [comments, setComments] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    loadLeaves();
  }, [currentUser]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveApi.getAll();
      setLeaves(data);
    } catch (err: any) {
      showError(err.message || 'Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showError('Please select both Start Date and End Date', 'Form Validation');
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.create({
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        leave_type: leaveType,
        comments: comments.trim() || undefined,
      });
      setComments('');
      showSuccess('Leave application submitted successfully with PENDING status!', 'Application Filed');
      await loadLeaves();
    } catch (err: any) {
      showError(err.message || 'Failed to submit leave request', 'Submission Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (currentUser?.role !== 'ADMIN') {
      showError('Forbidden: Admin privilege required to modify leave status.', 'Permission Denied');
      return;
    }
    try {
      await leaveApi.updateStatus(id, status);
      showSuccess(`Leave request has been ${status.toLowerCase()}!`, 'Status Updated');
      await loadLeaves();
    } catch (err: any) {
      showError(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Apply for leave and view real-time request statuses for <span className="font-bold text-gray-900">{currentUser?.full_name}</span>
        </p>
      </div>

      {/* Leave Form */}
      <div className="teamnest-card p-6 md:p-8">
        <h3 className="font-extrabold text-lg text-gray-900 mb-6 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-600" /> Apply for Time Off
        </h3>

        <form onSubmit={handleApplyLeave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add reason or notes for your leave application..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting Application...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>

      {/* Leave History List */}
      <div className="teamnest-card p-6">
        <h3 className="font-extrabold text-base text-gray-900 mb-4 flex items-center justify-between">
          <span>Leave Request History ({leaves.length})</span>
          {currentUser?.role === 'ADMIN' && (
            <span className="text-xs px-2.5 py-1 rounded-full badge-admin font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Approval Mode
            </span>
          )}
        </h3>

        {loading ? (
          <div className="py-8 flex justify-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-sm text-gray-400 py-6 text-center">No leave applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Comments</th>
                  <th className="p-3.5">Status</th>
                  {currentUser?.role === 'ADMIN' && <th className="p-3.5 text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={l.user?.avatar_url || currentUser?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-bold text-gray-900">{l.user?.full_name || currentUser?.full_name}</span>
                    </td>
                    <td className="p-3.5 font-bold text-gray-800">{l.leave_type}</td>
                    <td className="p-3.5 text-gray-600 text-xs font-mono">
                      {new Date(l.start_date).toLocaleDateString()} &rarr; {new Date(l.end_date).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-xs text-gray-500 max-w-xs truncate">
                      {l.comments ? (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-gray-400 shrink-0" />
                          {l.comments}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">None</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        l.status === 'APPROVED'
                          ? 'badge-approved' // Green
                          : l.status === 'REJECTED'
                          ? 'badge-rejected' // Red
                          : 'badge-pending' // Yellow
                      }`}>
                        {l.status}
                      </span>
                    </td>

                    {currentUser?.role === 'ADMIN' && (
                      <td className="p-3.5 text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(l.id, 'APPROVED')}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(l.id, 'REJECTED')}
                              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
