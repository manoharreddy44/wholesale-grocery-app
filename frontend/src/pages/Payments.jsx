import { useState, useEffect } from 'react';
import { Wallet, Plus, X } from 'lucide-react';
import api from '../api/axios';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    paymentMode: 'cash'
  });

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments');
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (modalOpen) fetchCustomers();
  }, [modalOpen]);

  const handleOpenModal = () => {
    setForm({ customerId: '', amount: '', paymentMode: 'cash' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || Number(form.amount) <= 0) {
      alert('Select a customer and enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/payments', {
        customerId: form.customerId,
        amount: Number(form.amount),
        paymentMode: form.paymentMode
      });
      alert('Payment recorded successfully.');
      handleCloseModal();
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payment Collection</h1>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No payments recorded yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.customerId ? (
                        <div>
                          <p className="font-medium text-slate-800">{p.customerId.shopName}</p>
                          <p className="text-xs text-slate-500">{p.customerId.ownerName}</p>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-green-700">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{p.paymentMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Record Payment</h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.shopName} – {c.ownerName} (Due: ₹{Number(c.dueAmount || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
