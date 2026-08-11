import React, { useState } from 'react';
import { X, Calendar, Receipt } from 'lucide-react';
import { leaveApi, expenseApi } from '../../services/api';
import { useUserStore } from '../../store/useUserStore';

interface QuickRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickRequestModal: React.FC<QuickRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useUserStore();
  const [tab, setTab] = useState<'leave' | 'expense'>('leave');

  // Form states
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Transport');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await leaveApi.create({
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        leave_type: leaveType,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await expenseApi.create({
        amount: parseFloat(amount),
        category,
        receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit expense claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Quick Request</h3>
            <p className="text-xs text-gray-500">Submitting as {currentUser?.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setTab('leave')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'leave' ? 'bg-white text-brand-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> Request Leave
          </button>
          <button
            onClick={() => setTab('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'expense' ? 'bg-white text-brand-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-4 h-4" /> Claim Expense
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Leave Form */}
        {tab === 'leave' && (
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Work From Home">Work From Home</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>
        )}

        {/* Expense Form */}
        {tab === 'expense' && (
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 85.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Travel & Transport">Travel & Transport</option>
                <option value="Client Dinner & Meal">Client Dinner & Meal</option>
                <option value="Software & Subscriptions">Software & Subscriptions</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Expense Claim'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
