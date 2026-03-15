import { useState, useEffect } from 'react';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import api from '../api/axios';

const statCards = [
  { key: 'sales', label: 'Total Sales', icon: DollarSign, color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { key: 'customers', label: 'Active Customers', icon: Users, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { key: 'lowStock', label: 'Low Stock Items', icon: Package, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' }
];

export default function Dashboard() {
  const [stats, setStats] = useState({ sales: 0, customers: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/customers'),
          api.get('/products')
        ]);
        const orders = ordersRes.data;
        const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const lowStock = productsRes.data.filter((p) => p.stock < 50).length;
        setStats({
          sales: totalSales,
          customers: customersRes.data.length,
          lowStock
        });
      } catch {
        setStats({ sales: 0, customers: 0, lowStock: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map(({ key, label, icon: Icon, color, bgLight, textColor }) => (
            <div
              key={key}
              className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${bgLight}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${textColor}`}>
                    {key === 'sales' ? `₹${stats[key].toLocaleString()}` : stats[key]}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-800">Quick overview</h2>
        </div>
        <p className="text-slate-600 text-sm">
          Use <strong>Products</strong> to manage inventory, <strong>Customers</strong> to view khata (dues), and <strong>POS</strong> to create new orders. Cash orders are settled immediately; credit orders add to the customer&apos;s due amount.
        </p>
      </div>
    </div>
  );
}
