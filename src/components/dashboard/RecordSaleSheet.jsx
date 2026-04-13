import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Minus, ShoppingCart, Trash2, Calendar } from 'lucide-react';
import { useToast } from '../common/Toast';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function RecordSaleSheet({ products, onRecordSale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [saleDate, setSaleDate] = useState(todayStr());
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.current_stock > 0
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) return prev;
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        cost_price: product.cost_price,
        max_stock: product.current_stock,
      }];
    });
    setSearchQuery('');
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: Math.min(newQty, item.max_stock) }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const saleTimestamp = new Date(`${saleDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString();

      for (const item of cart) {
        await onRecordSale({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.price,
          cost_price: item.cost_price,
          total_amount: item.price * item.quantity,
          profit: (item.price - item.cost_price) * item.quantity,
          created_at: saleTimestamp,
        });
      }

      showToast(`Sale recorded: ${formatCurrency(cartTotal)} (${cartItemCount} items)`, 'success');
      setIsOpen(false);
      setCart([]);
      setSaleDate(todayStr());
    } catch (err) {
      showToast(err.message || 'Failed to record sale', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setCart([]);
    setSearchQuery('');
    setSaleDate(todayStr());
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl shadow-lg shadow-amber-700/30 flex items-center justify-center active:scale-90 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={close}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Record Sale</h2>
                  {cart.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">{cartItemCount} items in cart</p>
                  )}
                </div>
                <button
                  onClick={close}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Date Picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    max={todayStr()}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Product Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Products</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search and add products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {searchQuery && (
                    <div className="mt-2 space-y-1 max-h-[30vh] overflow-y-auto border border-gray-100 rounded-xl">
                      {filteredProducts.map((product) => {
                        const inCart = cart.find((item) => item.product_id === product.id);
                        return (
                          <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(product.price)} &bull; {product.current_stock} in stock
                              </div>
                            </div>
                            {inCart ? (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                {inCart.quantity} in cart
                              </span>
                            ) : (
                              <Plus className="w-5 h-5 text-amber-700" />
                            )}
                          </button>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No products found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="w-4 h-4 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">Cart</span>
                    </div>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.product_id}
                          className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(item.price)} each
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(item.product_id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.max_stock}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-700 text-white active:scale-95 disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 w-20 text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total + Complete */}
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                          Total ({cartItemCount} items)
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">
                          {formatCurrency(cartTotal)}
                        </p>
                      </div>
                      {saleDate !== todayStr() && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          {new Date(saleDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleCompleteSale}
                      disabled={isProcessing || cart.length === 0}
                      className="w-full mt-4 py-3.5 rounded-xl bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isProcessing ? 'Processing...' : `Complete Sale \u2022 ${formatCurrency(cartTotal)}`}
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {cart.length === 0 && !searchQuery && (
                  <div className="text-center py-6">
                    <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Search and add products to the cart</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
