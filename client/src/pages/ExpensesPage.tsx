import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { expenseApi } from '../services/api';
import { Expense } from '../types';
import { useToast } from '../components/toast/ToastContext';
import {
  Receipt,
  Camera,
  DollarSign,
  Tag,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Transport');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenseRecords();
  }, [currentUser]);

  const loadExpenseRecords = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const records = await expenseApi.getAll(currentUser.id);
      setExpenses(records);
    } catch (err: any) {
      console.warn('Failed to load expenses:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        showSuccess('Receipt photo captured successfully!', 'Image Loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showError('Please enter a valid expense amount greater than $0', 'Validation Error');
      return;
    }

    setSubmitting(true);
    try {
      await expenseApi.create({
        amount: parseFloat(amount),
        category,
        receipt_url:
          receiptImage ||
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
        date: new Date().toISOString(),
      });

      setAmount('');
      setReceiptImage(null);
      showSuccess('Expense claim submitted for admin approval!', 'Claim Filed');
      await loadExpenseRecords();
    } catch (err: any) {
      showError(err.message || 'Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Receipt className="w-7 h-7 text-blue-600" /> Expense Submission Module
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Upload mobile camera receipts and file reimbursement requests for approval.
        </p>
      </div>

      {/* Expense Claim Form Card */}
      <div className="teamnest-card p-6 md:p-8">
        <form onSubmit={handleSubmitExpense} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" /> Amount ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-extrabold text-slate-900 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" /> Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="Travel & Transport">Travel & Transport</option>
                <option value="Client Dinner & Meal">Client Dinner & Meal</option>
                <option value="Office Supplies & Software">Office Supplies & Software</option>
                <option value="Lodging & Hotel">Lodging & Hotel</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          {/* Camera Input Integration */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Receipt Attachment (Mobile Camera Enabled)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                <Camera className="w-5 h-5 text-white" />
                <span>Snap Receipt</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileCapture}
                  className="hidden"
                />
              </label>

              {receiptImage && (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <img
                    src={receiptImage}
                    alt="Receipt Preview"
                    className="w-12 h-12 object-cover rounded-lg ring-1 ring-blue-300"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-blue-900 block">Receipt Attached</span>
                    <span className="text-blue-600 font-semibold">Ready for submission</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Upload className="w-4 h-4 text-white" />
            )}
            <span>{submitting ? 'Filing Claim...' : 'Submit Expense Claim'}</span>
          </button>
        </form>
      </div>

      {/* Claim History Section */}
      <div className="teamnest-card p-6">
        <h3 className="font-black text-base text-slate-900 mb-4">My Submitted Claims</h3>
        {loading ? (
          <div className="py-8 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No expense claims filed yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenses.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">{e.category}</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">${e.amount.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-1">
                    {new Date(e.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                    e.status === 'APPROVED' ? 'badge-approved' : e.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                  }`}>
                    {e.status}
                  </span>
                  {e.receipt_url && (
                    <a
                      href={e.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-extrabold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Receipt <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
