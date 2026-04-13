import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/currencyHelpers';

export function TopProducts({ products = [] }) {
  if (!products || products.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-400">No sales data yet. Start selling to see top products!</p>
      </Card>
    );
  }

  const rankColors = [
    'bg-amber-100 text-amber-700',
    'bg-gray-100 text-gray-600',
    'bg-orange-100 text-orange-700',
    'bg-gray-50 text-gray-500',
    'bg-gray-50 text-gray-500'
  ];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Top Selling</h3>
      <div className="space-y-2.5">
        {products.map((product, index) => (
          <div
            key={product.product_id}
            className="flex items-center gap-3"
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${rankColors[index] || rankColors[4]}`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {product.product_name}
              </p>
              <p className="text-xs text-gray-400">
                {product.total_quantity} sold
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">
                {formatCurrency(product.total_revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
