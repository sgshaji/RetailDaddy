import { useState } from 'react';
import { formatCurrency } from '../../utils/currencyHelpers';

export function ProductSelector({ products = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="pb-4 sticky top-0 z-10 bg-white">
        <div className="relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredProducts.map((product) => {
            const outOfStock = product.current_stock <= 0;
            return (
              <button
                key={product.id}
                onClick={() => !outOfStock && onSelect(product)}
                disabled={outOfStock}
                className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${
                  outOfStock
                    ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
                    : 'border-gray-100 bg-white hover:border-primary-300 hover:bg-primary-50 active:border-primary-400'
                }`}
              >
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {product.name}
                </p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  {formatCurrency(product.selling_price)}
                </p>
                <p className={`text-xs mt-1 ${
                  product.current_stock <= product.low_stock_threshold
                    ? 'text-amber-600 font-semibold'
                    : 'text-gray-400'
                }`}>
                  {outOfStock ? 'Out of stock' : `${product.current_stock} in stock`}
                </p>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
