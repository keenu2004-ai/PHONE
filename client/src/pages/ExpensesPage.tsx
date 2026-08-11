import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { expenseApi } from '../services/api';
import { Expense } from '../types';
import { useToast } from '../components/toast/ToastContext';
import { Receipt, Camera, RefreshCw, ExternalLink, DollarSign } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Transport');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    loadExpenses();
  }, [currentUser]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseApi.getAll();
      setExpenses(data);
    } catch (err: any) {
      showError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        showSuccess('Photo captured from mobile camera!', 'Receipt Attached');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showError('Please enter a valid expense amount greater than $0', 'Invalid Amount');
      return;
    }

    setSubmitting(true);

    try {
      const finalReceiptUrl = receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400';

      await expenseApi.create({
        amount: parseFloat(amount),
        category,
        receipt_url: finalReceiptUrl,
      });

      setAmount('');
      setReceiptImage(null);
      setReceiptFileName('');
      showSuccess(`Expense claim for $${parseFloat(amount).toFixed(2)} submitted!`, 'Claim Filed');
      await loadExpenses();
    } catch (err: any) {
      showError(err.message || 'Failed to file claim', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await expenseApi.updateStatus(id, status);
      showSuccess(`Expense claim ${status.toLowerCase()}!`, 'Claim Updated');
      await loadExpenses();
    } catch (err: any) {
      showError(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Expense Claims</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mobile camera receipt capture & reimbursement manager for <span className="font-bold text-gray-900">{currentUser?.full_name}</span>
        </p>
      </div>

      {/* Expense Form with Mobile Camera Integration */}
      <div className="teamnest-card p-6 md:p-8">
        <h3 className="font-extrabold text-lg text-gray-900 mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-brand-600" /> Submit Expense Claim
        </h3>

        <form onSubmit={handleCreateExpense} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Expense Amount ($ USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-lg font-extrabold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Travel & Transport">Travel & Transport</option>
                <option value="Client Dinner & Meal">Client Dinner & Meal</option>
                <option value="Software & Subscriptions">Software & Subscriptions</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Receipt Image Capture
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold text-base shadow-md shadow-brand-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
            >
              <Camera className="w-6 h-6" />
              <span>{receiptFileName ? 'Change Receipt Photo' : 'Snap Receipt'}</span>
            </button>

            {receiptImage && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={receiptImage} alt="Receipt preview" className="w-14 h-14 rounded-lg object-cover border border-gray-300 shadow-xs" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">Photo Captured</div>
                    <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{receiptFileName || 'Camera image'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setReceiptImage(null); setReceiptFileName(''); }}
                  className="text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-extrabold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Filing Claim...' : 'Push Claim to API'}
          </button>
        </form>
      </div>

      {/* Claim Audit History */}
      <div className="teamnest-card p-6">
        <h3 className="font-extrabold text-base text-gray-900 mb-4">Submitted Expense Claims ({expenses.length})</h3>
        {loading ? (
          <div className="py-8 flex justify-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Receipt</th>
                  <th className="p-3.5">Status</th>
                  {currentUser?.role === 'ADMIN' && <th className="p-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={e.user?.avatar_url || currentUser?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-bold text-gray-900">{e.user?.full_name || currentUser?.full_name}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">{e.category}</td>
                    <td className="p-3.5 font-extrabold text-gray-900 font-mono">${e.amount.toFixed(2)}</td>
                    <td className="p-3.5 text-xs">
                      {e.receipt_url ? (
                        <div className="flex items-center gap-2">
                          <img src={e.receipt_url} alt="" className="w-7 h-7 rounded object-cover border border-gray-200" />
                          <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold badge-${e.status.toLowerCase()}`}>
                        {e.status}
                      </span>
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="p-3.5 text-right">
                        {e.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(e.id, 'APPROVED')}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(e.id, 'REJECTED')}
                              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
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
