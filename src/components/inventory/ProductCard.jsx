import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductCard({ product, index, onUpdateStock, velocity = 0 }) {
  const isLowStock = product.current_stock <= product.low_stock_threshold;
  const isOutOfStock = product.current_stock === 0;
  const daysRemaining = velocity > 0 ? Math.floor((product.current_stock / velocity) * 7) : null;

  const stockPct = product.low_stock_threshold > 0
    ? Math.min((product.current_stock / (product.low_stock_threshold * 3)) * 100, 100)
    : 50;
  const barColor = isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{product.name}</span>
            {isOutOfStock && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-lg shrink-0">OUT</span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg shrink-0">LOW</span>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {product.sku ? `${product.sku} · ` : ''}₹{Number(product.price).toFixed(0)}
            {velocity > 0 && <span className="text-gray-300"> · ~{velocity.toFixed(1)}/wk</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onUpdateStock(product.id, Math.max(0, product.current_stock - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-90 transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-bold text-gray-900 w-8 text-center tabular-nums">
            {product.current_stock}
          </span>
          <button
            onClick={() => onUpdateStock(product.id, product.current_stock + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-700 text-white hover:bg-amber-800 active:scale-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${stockPct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">{product.current_stock} in stock</span>
          {daysRemaining !== null && daysRemaining < 30 && (
            <span className={`text-xs font-semibold ${daysRemaining < 7 ? 'text-red-500' : 'text-amber-600'}`}>
              ~{daysRemaining}d left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
