import { useState, useEffect } from 'react';
import { DollarSign, Users, Wallet, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: res } = await api.get('/reports');
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-slate-500">Loading reports...</div>
      </div>
    );
  }

  const summaryCards = [
    {
      key: 'todaySales',
      label: "Today's Sales",
      value: `₹${Number(data?.todaySales ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      key: 'pendingPayments',
      label: 'Pending Payments',
      value: data?.pendingPaymentsCount ?? 0,
      icon: Users,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      key: 'totalDue',
      label: 'Total Due (Khata)',
      value: `₹${Number(data?.totalDue ?? 0).toLocaleString()}`,
      icon: Wallet,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  const weeklySales = data?.weeklySales ?? [];
  const topProducts = data?.topProducts ?? [];
  const topCustomers = data?.topCustomers ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {summaryCards.map(({ key, label, value, icon: Icon, color, bgLight, textColor }) => (
          <div
            key={key}
            className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${bgLight}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {weeklySales.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-800">Weekly Sales (Last 7 Days)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Sales']} />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Top Selling Products</h2>
          </div>
          <div className="overflow-x-auto">
            {topProducts.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">No data yet</p>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-2">Product</th>
                    <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-2">Qty Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p, idx) => (
                    <tr key={p.productId || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-sm font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-2 text-sm text-right text-slate-600">{p.totalQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Top Customers</h2>
          </div>
          <div className="overflow-x-auto">
            {topCustomers.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">No data yet</p>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-2">Customer</th>
                    <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-2">Total Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCustomers.map((c, idx) => (
                    <tr key={c.customerId || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2">
                        <p className="text-sm font-medium text-slate-800">{c.shopName}</p>
                        <p className="text-xs text-slate-500">{c.ownerName}</p>
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-slate-800">
                        ₹{Number(c.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
