import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ProductSelector } from '../components/sales/ProductSelector';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Card } from '../components/common/Card';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/currencyHelpers';

export function QuickSale() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { products } = useProducts();
  const { createSale } = useSales();
  const { showToast } = useToast();

  const handleProductSelect = (product) => {
    if (product.current_stock <= 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setShowProductSelector(false);
  };

  const incrementQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.current_stock) {
      setQuantity(q => q + 1);
    } else if (selectedProduct) {
      showToast('Not enough stock available', 'warning');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleCompleteSale = async () => {
    if (!selectedProduct) {
      showToast('Please select a product', 'warning');
      return;
    }

    if (quantity <= 0) {
      showToast('Quantity must be at least 1', 'warning');
      return;
    }

    if (quantity > selectedProduct.current_stock) {
      showToast('Not enough stock available', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      await createSale({
        product_id: selectedProduct.id,
        quantity,
        unit_price: selectedProduct.selling_price,
        payment_method: 'cash'
      });

      showToast('Sale completed successfully!', 'success');

      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error('Error completing sale:', error);
      showToast(error.message || 'Failed to complete sale', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = selectedProduct ? selectedProduct.selling_price * quantity : 0;

  return (
    <Layout title="Quick Sale">
      <div className="flex flex-col h-[calc(100dvh-120px)]">
        {/* Product Selection */}
        <div className="p-4">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowProductSelector(true)}
            size="large"
          >
            {selectedProduct ? selectedProduct.name : '📦 Select Product'}
          </Button>
        </div>

        {/* Quantity Picker - Only show when product selected */}
        {selectedProduct && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md p-6">
              {/* Product Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedProduct.name}
                </h2>
                <p className="text-lg text-gray-600">
                  Price: {formatCurrency(selectedProduct.selling_price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Available Stock: {selectedProduct.current_stock}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-20 h-20 flex items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-xl text-3xl font-bold transition-all active:scale-95 disabled:opacity-30"
                >
                  −
                </button>

                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val <= selectedProduct.current_stock) {
                        setQuantity(Math.max(1, val));
                      }
                    }}
                    className="w-24 h-20 text-4xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    inputMode="numeric"
                  />
                  <span className="text-xs text-gray-500 mt-1">Quantity</span>
                </div>

                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= selectedProduct.current_stock}
                  className="w-20 h-20 flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl text-3xl font-bold transition-all active:scale-95 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Total Display */}
              <div className="bg-primary-50 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-primary-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedProduct && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <p className="text-6xl mb-4">💰</p>
              <p className="text-lg font-medium">Select a product to start</p>
              <p className="text-sm mt-2">Tap the button above to choose a product</p>
            </div>
          </div>
        )}

        {/* Complete Sale Button - Sticky at bottom */}
        {selectedProduct && (
          <div className="p-4 bg-white border-t border-gray-200">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleCompleteSale}
              disabled={isProcessing || !selectedProduct || quantity <= 0}
            >
              {isProcessing ? 'Processing...' : `Complete Sale - ${formatCurrency(totalAmount)}`}
            </Button>
          </div>
        )}
      </div>

      {/* Product Selector Modal */}
      <Modal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        title="Select Product"
        size="full"
      >
        <ProductSelector
          products={products || []}
          onSelect={handleProductSelect}
        />
      </Modal>
    </Layout>
  );
}
