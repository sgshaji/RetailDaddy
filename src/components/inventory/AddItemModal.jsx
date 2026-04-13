import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';

const PRESET_CATEGORIES = ['General', 'Coffee', 'Tea', 'Equipment', 'Accessories', 'Pottery', 'Ceramics', 'Gifts'];

export function AddItemModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '', sku: '', stock: '', price: '', cost_price: '', category: 'General', lowStockThreshold: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        name: formData.name,
        sku: formData.sku,
        current_stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price) || 0,
        category: formData.category,
        low_stock_threshold: parseInt(formData.lowStockThreshold) || 10,
      });
      setFormData({ name: '', sku: '', stock: '', price: '', cost_price: '', category: 'General', lowStockThreshold: '' });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={update('name')}
                  placeholder="e.g. Handmade Mug"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SKU</label>
                  <input type="text" value={formData.sku} onChange={update('sku')} placeholder="MUG-001" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                  <input
                    type="text"
                    list="add-item-categories"
                    value={formData.category}
                    onChange={update('category')}
                    placeholder="General"
                    className={inputClass}
                  />
                  <datalist id="add-item-categories">
                    {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selling Price (₹) *</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={update('price')} placeholder="0.00" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cost Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={formData.cost_price} onChange={update('cost_price')} placeholder="0.00" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Initial Stock *</label>
                  <input type="number" min="0" value={formData.stock} onChange={update('stock')} placeholder="0" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Low Stock Alert</label>
                  <input type="number" min="0" value={formData.lowStockThreshold} onChange={update('lowStockThreshold')} placeholder="10" className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition-colors active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
