import { useState } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/inventory/ProductCard';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../components/common/Toast';

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { products, allProducts, lowStockProducts, addProduct, updateStock } = useProducts(searchQuery);
  const { showToast } = useToast();

  const handleAddProduct = async (product) => {
    try { await addProduct(product); showToast('Product added successfully', 'success'); }
    catch (err) { showToast(err.message || 'Failed to add product', 'error'); }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try { await updateStock(productId, newStock); }
    catch (err) { showToast(err.message || 'Failed to update stock', 'error'); }
  };

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory</h1>
            <p className="text-sm text-gray-500">{allProducts.length} items tracked</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95"><Plus className="w-6 h-6" /></button>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="px-5 mb-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-900">{lowStockProducts.length} items low on stock</div>
                <div className="text-xs text-amber-700 mt-1">Review and reorder soon</div>
              </div>
            </motion.div>
          </div>
        )}
        <div className="px-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="px-5 space-y-3">
          {products.map((product, index) => (<ProductCard key={product.id} product={product} index={index} onUpdateStock={handleUpdateStock} />))}
        </div>
        {products.length === 0 && <div className="px-5 py-12 text-center"><div className="text-sm text-gray-500">No products found</div></div>}
        <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
      </div>
    </Layout>
  );
}
