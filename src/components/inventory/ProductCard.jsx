import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductCard({ product, index, onUpdateStock, velocity = 0 }) {
  const isLowStock = product.current_stock <= product.low_stock_threshold;
  const isOutOfStock = product.current_stock === 0;
  const daysRemaining = velocity > 0 ? Math.floor((product.current_stock / velocity) * 7) : null;

  // Stock level visual bar
  const stockPct = product.low_stock_threshold > 0
    ? Math.min((product.current_stock / (product.low_stock_threshold * 3)) * 100, 100)
    : 50;
  const barColor = isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white rounded-xl p-4 border shadow-sm ${
        isOutOfStock ? 'border-red-200' : isLowStock ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{product.name}</span>
            {isOutOfStock && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full shrink-0">OUT</span>}
            {isLowStock && !isOutOfStock && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full shrink-0">LOW</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {product.sku ? `${product.sku} · ` : ''}₹{Number(product.price).toFixed(0)}
            {velocity > 0 && ` · ~${velocity.toFixed(1)}/week`}
          </div>
        </div>
      </div>

      {/* Stock bar */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${stockPct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{product.current_stock} in stock</span>
            {daysRemaining !== null && daysRemaining < 30 && (
              <span className={`text-xs font-medium ${daysRemaining < 7 ? 'text-red-500' : 'text-amber-600'}`}>
                ~{daysRemaining}d left
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => onUpdateStock(product.id, Math.max(0, product.current_stock - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">
            <Minus className="w-3 h-3" />
          </button>
          <button onClick={() => onUpdateStock(product.id, product.current_stock + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-700 text-white hover:bg-amber-800 active:scale-95 transition-all">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
