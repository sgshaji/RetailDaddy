import { motion } from 'framer-motion';

export function TopProducts({ products }) {
  if (!products || products.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>;
  const maxSold = Math.max(...products.map((p) => p.sold));

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <motion.div key={product.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-xs text-gray-500 mt-1">{product.sold} units sold</div>
            </div>
            <div className="text-right"><div className="text-sm font-semibold text-gray-900">₹{Number(product.revenue).toLocaleString('en-IN')}</div></div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(product.sold / maxSold) * 100}%` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
