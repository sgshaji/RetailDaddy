import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useProducts } from '../hooks/useProducts';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../components/common/Toast';

export function Inventory() {
  const [filter, setFilter] = useState('all'); // 'all' or 'low'
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('in'); // 'in', 'out', 'adjust'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const { products, lowStockProducts } = useProducts();
  const { addStockIn, addStockOut, adjustStock } = useInventory();
  const { showToast } = useToast();

  const displayProducts = filter === 'low' ? lowStockProducts : products;

  const handleAdjustment = async () => {
    if (!adjustingProduct) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid quantity', 'warning');
      return;
    }

    try {
      if (adjustmentType === 'in') {
        await addStockIn(adjustingProduct.id, qty, adjustingProduct.cost_price, reason);
        showToast(`Added ${qty} ${adjustingProduct.unit} to stock`, 'success');
      } else if (adjustmentType === 'out') {
        await addStockOut(adjustingProduct.id, qty, reason);
        showToast(`Removed ${qty} ${adjustingProduct.unit} from stock`, 'success');
      } else if (adjustmentType === 'adjust') {
        await adjustStock(adjustingProduct.id, qty, reason);
        showToast(`Stock adjusted to ${qty} ${adjustingProduct.unit}`, 'success');
      }

      // Reset form
      setAdjustingProduct(null);
      setQuantity('');
      setReason('');
    } catch (error) {
      showToast(error.message || 'Failed to adjust stock', 'error');
    }
  };

  return (
    <Layout title="Inventory">
      <div className="flex flex-col h-[calc(100dvh-120px)]">
        {/* Filter Tabs */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                filter === 'low'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Low Stock {lowStockProducts && lowStockProducts.length > 0 ? `(${lowStockProducts.length})` : ''}
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayProducts && displayProducts.length > 0 ? (
            displayProducts.map(product => {
              const isLowStock = product.current_stock <= product.low_stock_threshold;

              return (
                <Card key={product.id} className={`p-4 ${isLowStock ? 'border-2 border-orange-300' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    {isLowStock && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Current Stock</p>
                      <p className={`text-2xl font-bold ${
                        isLowStock ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {product.current_stock} {product.unit}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Alert at: {product.low_stock_threshold} {product.unit}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setAdjustingProduct(product);
                          setAdjustmentType('in');
                          setQuantity('');
                          setReason('');
                        }}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 active:scale-95"
                      >
                        + Add Stock
                      </button>
                      <button
                        onClick={() => {
                          setAdjustingProduct(product);
                          setAdjustmentType('out');
                          setQuantity('');
                          setReason('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 active:scale-95"
                      >
                        − Remove
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-6xl mb-4">📋</p>
              <p className="text-lg font-medium">
                {filter === 'low' ? 'No low stock items' : 'No products found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        title={`${adjustmentType === 'in' ? 'Add' : adjustmentType === 'out' ? 'Remove' : 'Adjust'} Stock`}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setAdjustingProduct(null)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdjustment}
              fullWidth
            >
              Confirm
            </Button>
          </div>
        }
      >
        {adjustingProduct && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-bold text-lg">{adjustingProduct.name}</p>
              <p className="text-sm text-gray-600 mt-2">
                Current Stock: <span className="font-bold">{adjustingProduct.current_stock} {adjustingProduct.unit}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAdjustmentType('in')}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  adjustmentType === 'in'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Add Stock
              </button>
              <button
                onClick={() => setAdjustmentType('out')}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  adjustmentType === 'out'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Remove
              </button>
              <button
                onClick={() => setAdjustmentType('adjust')}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  adjustmentType === 'adjust'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Set Amount
              </button>
            </div>

            <Input
              label={adjustmentType === 'adjust' ? 'New Stock Amount' : 'Quantity'}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="0"
              required
            />

            <Input
              label="Reason (Optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., New delivery, Damaged goods, etc."
            />

          </div>
        )}
      </Modal>
    </Layout>
  );
}
