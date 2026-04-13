import { useState, useMemo } from 'react';
import { Search, Plus, AlertTriangle, Package, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/inventory/ProductCard';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useToast } from '../components/common/Toast';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function HealthBar({ healthy, low, out, total }) {
  if (total === 0) return null;
  const hPct = (healthy / total) * 100;
  const lPct = (low / total) * 100;
  const oPct = (out / total) * 100;
  return (
    <div className="flex rounded-full h-2.5 overflow-hidden bg-gray-100">
      {hPct > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${hPct}%` }} />}
      {lPct > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${lPct}%` }} />}
      {oPct > 0 && <div className="bg-red-400 transition-all" style={{ width: `${oPct}%` }} />}
    </div>
  );
}

function CollapsibleSection({ title, icon, count, severity, defaultOpen, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = {
    critical: 'text-red-600 bg-red-50',
    warning: 'text-amber-700 bg-amber-50',
    info: 'text-blue-600 bg-blue-50',
  };
  return (
    <div className="mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-5 py-2">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[severity]}`}>{icon}</span>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${colors[severity]}`}>{count}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 space-y-2 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { products, allProducts, lowStockProducts, addProduct, updateStock } = useProducts(searchQuery);
  const { sales } = useSales();
  const { showToast } = useToast();

  // Calculate velocities
  const velocities = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = sales.filter(s => new Date(s.created_at) >= thirtyDaysAgo);
    const map = {};
    recent.forEach(s => { map[s.product_id] = (map[s.product_id] || 0) + s.quantity; });
    const result = {};
    Object.entries(map).forEach(([id, qty]) => { result[id] = qty / 4.3; });
    return result;
  }, [sales]);

  // Smart sections
  const outOfStock = allProducts.filter(p => p.current_stock === 0);
  const reorderNow = allProducts.filter(p => {
    const v = velocities[p.id] || 0;
    const daysLeft = v > 0 ? (p.current_stock / v) * 7 : 999;
    return p.current_stock > 0 && (daysLeft < 7 || p.current_stock <= p.low_stock_threshold);
  });
  const deadStock = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProductIds = new Set(sales.filter(s => new Date(s.created_at) >= thirtyDaysAgo).map(s => s.product_id));
    return allProducts.filter(p => !recentProductIds.has(p.id) && p.current_stock > 0);
  }, [allProducts, sales]);

  // Categories
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
    return ['All', ...cats];
  }, [allProducts]);

  const displayProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    return result;
  }, [products, selectedCategory]);

  // Inventory value
  const totalValue = allProducts.reduce((s, p) => s + p.price * p.current_stock, 0);
  const healthyCount = allProducts.filter(p => p.current_stock > p.low_stock_threshold).length;

  const handleAddProduct = async (product) => {
    try { await addProduct(product); showToast('Product added!', 'success'); }
    catch (err) { showToast(err.message || 'Failed to add product', 'error'); }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try { await updateStock(productId, newStock); }
    catch (err) { showToast(err.message || 'Failed to update stock', 'error'); }
  };

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Inventory</h1>
            <p className="text-sm text-gray-400 mt-0.5">{allProducts.length} items &bull; {formatCurrency(totalValue)} total value</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="w-11 h-11 flex items-center justify-center bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors shadow-md active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Health Bar */}
        {allProducts.length > 0 && (
          <div className="px-5 mt-4">
            <HealthBar healthy={healthyCount} low={lowStockProducts.length} out={outOfStock.length} total={allProducts.length} />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{healthyCount} healthy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{lowStockProducts.length} low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{outOfStock.length} out</span>
            </div>
          </div>
        )}

        {/* Smart Sections */}
        <div className="mt-4">
          {outOfStock.length > 0 && (
            <CollapsibleSection title="Out of Stock" icon={<AlertTriangle className="w-4 h-4" />} count={outOfStock.length} severity="critical" defaultOpen>
              {outOfStock.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={velocities[p.id]} />
              ))}
            </CollapsibleSection>
          )}
          {reorderNow.length > 0 && (
            <CollapsibleSection title="Reorder Soon" icon={<Package className="w-4 h-4" />} count={reorderNow.length} severity="warning" defaultOpen={outOfStock.length === 0}>
              {reorderNow.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={velocities[p.id]} />
              ))}
            </CollapsibleSection>
          )}
          {deadStock.length > 0 && (
            <CollapsibleSection title="Slow Movers (30+ days)" icon={<TrendingDown className="w-4 h-4" />} count={deadStock.length} severity="info" defaultOpen={false}>
              {deadStock.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={0} />
              ))}
            </CollapsibleSection>
          )}
        </div>

        {/* Search + Category Filter */}
        <div className="px-5 mt-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          {categories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-amber-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Products */}
        <div className="px-5 mt-4">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          <div className="space-y-2">
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onUpdateStock={handleUpdateStock} velocity={velocities[product.id]} />
            ))}
          </div>
          {displayProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">{allProducts.length === 0 ? 'Your shelves are bare — add your first creation!' : 'No products match your search'}</p>
            </div>
          )}
        </div>

        <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
      </div>
    </Layout>
  );
}
