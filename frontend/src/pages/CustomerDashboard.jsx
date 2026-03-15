import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShoppingBag, Package } from 'lucide-react';
import api from '../api/axios';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/customers/me'),
          api.get(`/orders/customer/${user.id}`)
        ]);
        setProfile(profileRes.data);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch {
        setProfile(null);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Dashboard</h1>

      {profile && (
        <div className="mb-6 p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Welcome, {profile.ownerName}</p>
          <p className="font-medium text-slate-800">{profile.shopName}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-slate-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">Due (Khata)</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">
                ₹{Number(profile?.dueAmount ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-200 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-amber-800" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-6 flex items-center justify-center gap-3 hover:border-primary-500 hover:bg-primary-50 transition"
        >
          <ShoppingBag className="w-8 h-8 text-primary-600" />
          <span className="font-semibold text-primary-700">Browse Catalog</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No orders yet. Browse the catalog to place an order request.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Items</th>
                  <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {order.items?.length ?? 0} item(s)
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">₹{Number(order.total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
