import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProductForm } from '../components/products/ProductForm';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/currencyHelpers';

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts({
    search: searchTerm,
    category: selectedCategory !== 'All' ? selectedCategory : undefined
  });

  const { showToast } = useToast();

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      showToast('Product added successfully', 'success');
      setShowAddModal(false);
    } catch (error) {
      showToast(error.message || 'Failed to add product', 'error');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await updateProduct(editingProduct.id, productData);
      showToast('Product updated successfully', 'success');
      setEditingProduct(null);
    } catch (error) {
      showToast(error.message || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Delete ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        showToast('Product deleted', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to delete product', 'error');
      }
    }
  };

  return (
    <Layout title="Products">
      <div className="flex flex-col h-[calc(100dvh-120px)]">
        {/* Search and Filter */}
        <div className="p-4 bg-white border-b border-gray-200 space-y-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full h-12 px-4 text-base rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />

          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {products && products.length > 0 ? (
            products.map(product => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.category}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Selling Price</p>
                        <p className="font-bold text-primary-600">
                          {formatCurrency(product.selling_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className={`font-bold ${
                          product.current_stock <= product.low_stock_threshold
                            ? 'text-orange-600'
                            : 'text-gray-900'
                        }`}>
                          {product.current_stock} {product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:scale-95"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-6xl mb-4">📦</p>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-2">Add your first product to get started</p>
            </div>
          )}
        </div>

        {/* Add Product FAB */}
        <div className="fixed bottom-24 right-4 z-30">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl active:scale-95 transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="large"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => document.getElementById('product-form-submit')?.click()} fullWidth>
              Add Product
            </Button>
          </div>
        }
      >
        <ProductForm
          onSave={handleAddProduct}
          onCancel={() => setShowAddModal(false)}
          renderButtons
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="large"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditingProduct(null)} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => document.getElementById('product-form-submit')?.click()} fullWidth>
              Update Product
            </Button>
          </div>
        }
      >
        <ProductForm
          product={editingProduct}
          onSave={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
          renderButtons
        />
      </Modal>
    </Layout>
  );
}
