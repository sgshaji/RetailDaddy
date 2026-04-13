import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductCard({ product, index, onUpdateStock }) {
  const isLowStock = product.current_stock <= product.low_stock_threshold;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white rounded-xl p-4 border ${isLowStock ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            {isLowStock && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Low</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">SKU: {product.sku || '—'} &bull; ₹{Number(product.price).toFixed(2)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Stock Level</div>
        <div className="flex items-center gap-3">
          <button onClick={() => onUpdateStock(product.id, Math.max(0, product.current_stock - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"><Minus className="w-4 h-4" /></button>
          <div className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">{product.current_stock}</div>
          <button onClick={() => onUpdateStock(product.id, product.current_stock + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}
