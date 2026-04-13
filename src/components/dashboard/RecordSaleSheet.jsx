import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Minus } from 'lucide-react';
import { useToast } from '../common/Toast';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RecordSaleSheet({ products, onRecordSale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.current_stock > 0);
  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSelectProduct = (product) => { setSelectedProduct(product); setQuantity(1); setSearchQuery(''); };

  const handleCompleteSale = async () => {
    if (!selectedProduct || quantity <= 0) return;
    setIsProcessing(true);
    try {
      await onRecordSale({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        unit_price: selectedProduct.price,
        cost_price: selectedProduct.cost_price,
        total_amount: selectedProduct.price * quantity,
        profit: (selectedProduct.price - selectedProduct.cost_price) * quantity,
      });
      showToast(`Sale recorded: ${formatCurrency(totalAmount)}`, 'success');
      setIsOpen(false); setSelectedProduct(null); setQuantity(1);
    } catch (err) {
      showToast(err.message || 'Failed to record sale', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const close = () => { setIsOpen(false); setSelectedProduct(null); setQuantity(1); setSearchQuery(''); };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-all">
        <Plus className="w-6 h-6" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={close} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Record Sale</h2>
                <button onClick={close} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5">
                {!selectedProduct ? (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                    </div>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button key={product.id} onClick={() => handleSelectProduct(product)} className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatCurrency(product.price)} &bull; {product.current_stock} in stock</div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No products available</p>}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-900">{selectedProduct.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatCurrency(selectedProduct.price)} per unit &bull; {selectedProduct.current_stock} in stock</div>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-30"><Minus className="w-5 h-5" /></button>
                      <div className="text-4xl font-bold text-gray-900 min-w-[4rem] text-center">{quantity}</div>
                      <button onClick={() => setQuantity((q) => Math.min(selectedProduct.current_stock, q + 1))} disabled={quantity >= selectedProduct.current_stock} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-30"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Total</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedProduct(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Back</button>
                      <button onClick={handleCompleteSale} disabled={isProcessing} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">{isProcessing ? 'Processing...' : 'Complete Sale'}</button>
                    </div>
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
