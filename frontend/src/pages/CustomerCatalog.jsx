import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import api from '../api/axios';

const DEFAULT_IMAGE = 'https://placehold.co/400x400/eeeeee/333333?text=Product';

export default function CustomerCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    if (product.stock < 1) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.wholesalePrice,
          qty: 1,
          maxStock: product.stock
        }
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const newQty = Math.max(0, Math.min(i.maxStock, i.qty + delta));
          return { ...i, qty: newQty };
        })
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item to cart' });
      return;
    }
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/orders', {
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
        discount: 0,
        paymentType: 'credit'
      });
      setCart([]);
      setMessage({ type: 'success', text: 'Order request submitted. Admin will approve and add to your Khata.' });
      setProducts((await api.get('/products')).data);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit order request'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Browse Catalog</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={p.stock < 1}
                    className="text-left rounded-xl border border-slate-200 p-3 hover:border-primary-300 hover:bg-primary-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <div className="w-full h-48 bg-slate-100 mb-2 overflow-hidden rounded-md">
                      <img
                        src={p.imageUrl || DEFAULT_IMAGE}
                        alt={p.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    <p className="font-medium text-slate-800 truncate text-sm">{p.name}</p>
                    <p className="text-xs text-primary-600 font-medium">₹{p.wholesalePrice}</p>
                    <p className="text-xs text-slate-500">Stock: {p.stock}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-20">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Cart</span>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Cart is empty</p>
              ) : (
                <ul className="space-y-2">
                  {cart.map((i) => (
                    <li key={i.productId} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate font-medium text-slate-800">{i.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQty(i.productId, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(i.productId, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="w-14 text-right font-medium">₹{(i.price * i.qty).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(i.productId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span className="text-primary-600">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500">Orders are sent as requests. Admin will approve and add to your Khata.</p>
              {message.text && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {submitting ? 'Submitting...' : 'Submit Order Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
