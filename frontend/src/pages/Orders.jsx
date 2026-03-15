import { useState, useEffect, Fragment } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId) => {
    setApprovingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'completed' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve order');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-slate-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Orders</h1>

      {pendingOrders.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <p className="text-sm font-medium text-amber-800">
            {pendingOrders.length} pending order request(s) from customers. Approve to deduct stock and add to their Khata.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No orders yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Items</th>
                  <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="w-28 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <Fragment key={order._id}>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {order.customerId ? (
                          <div>
                            <p className="font-medium text-slate-800">{order.customerId.shopName}</p>
                            <p className="text-xs text-slate-500">{order.customerId.ownerName} · {order.customerId.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">Walk-in</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
                        >
                          {order.items?.length ?? 0} item(s)
                          {expandedId === order._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
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
                      <td className="px-4 py-3">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(order._id)}
                            disabled={approvingId === order._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            {approvingId === order._id ? '...' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === order._id && order.items?.length > 0 && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium text-slate-700 mb-2">Order items:</p>
                            <ul className="space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-slate-600">
                                  <span>{item.name} × {item.qty}</span>
                                  <span>₹{(item.price * item.qty).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
