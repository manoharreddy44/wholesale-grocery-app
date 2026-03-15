import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote } from 'lucide-react';
import api from '../api/axios';

const DEFAULT_IMAGE = 'https://placehold.co/400x400/eeeeee/333333?text=Product';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const filteredCustomers = customers.filter((c) => {
    const term = customerSearch.toLowerCase();
    const text = `${c.shopName} ${c.ownerName} ${c.phone} ${c.village || ''}`.toLowerCase();
    return text.includes(term);
  });
  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers')
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      } catch {
        setProducts([]);
        setCustomers([]);
      }
    };
    fetchData();
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
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item to cart' });
      return;
    }
    if (paymentType === 'credit' && !selectedCustomerId) {
      setMessage({ type: 'error', text: 'Select a customer for credit payment' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/orders', {
        customerId: selectedCustomerId || undefined,
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
        discount: discountAmount,
        paymentType
      });
      setCart([]);
      setDiscount(0);
      setMessage({ type: 'success', text: 'Order completed successfully!' });
      alert('Order completed successfully!');
      const [productsRes, customersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers')
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete order';
      setMessage({ type: 'error', text: msg });
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Point of Sale</h1>

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
            {filteredProducts.length === 0 && (
              <p className="text-center text-slate-500 py-8">No products. Add products or run seed.</p>
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
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary-600">₹{total.toFixed(2)}</span>
              </div>
              <div className="relative">
                <label className="block text-sm text-slate-600 mb-1">Customer (for Khata)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={selectedCustomer ? `${selectedCustomer.shopName} – ${selectedCustomer.ownerName}` : customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomerId('');
                      setCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setCustomerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 200)}
                    placeholder="Search or select customer..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {selectedCustomerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId('');
                        setCustomerSearch('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {customerDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId('');
                          setCustomerSearch('');
                          setCustomerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${!selectedCustomerId && !customerSearch ? 'bg-primary-50 text-primary-700' : ''}`}
                      >
                        Walk-in / Cash only
                      </button>
                    </li>
                    {filteredCustomers.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-slate-500">No customer found</li>
                    ) : (
                      filteredCustomers.map((c) => (
                        <li key={c._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(c._id);
                              setCustomerSearch('');
                              setCustomerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${selectedCustomerId === c._id ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            {c.shopName} – {c.ownerName}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">Payment</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-medium transition ${
                      paymentType === 'cash'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('credit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-medium transition ${
                      paymentType === 'credit'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Credit
                  </button>
                </div>
              </div>
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
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
