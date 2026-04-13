import { useState, useMemo } from 'react';
import { Search, Plus, TriangleAlert as AlertTriangle, Package, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="flex rounded-full h-2 overflow-hidden bg-gray-100">
      {hPct > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${hPct}%` }} />}
      {lPct > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${lPct}%` }} />}
      {oPct > 0 && <div className="bg-red-400 transition-all" style={{ width: `${oPct}%` }} />}
    </div>
  );
}

function CollapsibleSection({ title, icon, count, severity, defaultOpen, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = {
    critical: { badge: 'bg-red-100 text-red-600', icon: 'bg-red-100 text-red-600', header: 'text-red-700' },
    warning: { badge: 'bg-amber-100 text-amber-700', icon: 'bg-amber-100 text-amber-700', header: 'text-amber-800' },
    info: { badge: 'bg-sky-100 text-sky-600', icon: 'bg-sky-100 text-sky-600', header: 'text-sky-700' },
  };
  const s = styles[severity];
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-7 h-7 rounded-xl flex items-center justify-center ${s.icon}`}>{icon}</span>
          <span className={`text-sm font-semibold ${s.header}`}>{title}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>{count}</span>
        </div>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isOpen ? 'bg-gray-100' : 'bg-gray-50'}`}>
          {isOpen
            ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 space-y-2 pb-3">{children}</div>
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

  const totalValue = allProducts.reduce((s, p) => s + p.price * p.current_stock, 0);
  const healthyCount = allProducts.filter(p => p.current_stock > p.low_stock_threshold).length;
  const alertCount = outOfStock.length + reorderNow.length;

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
      <div className="pb-28">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {allProducts.length} items &bull; {formatCurrency(totalValue)} value
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-700 text-white px-4 py-2.5 rounded-2xl hover:bg-amber-800 transition-colors shadow-sm active:scale-95 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Health Bar */}
        {allProducts.length > 0 && (
          <div className="px-5 mb-5">
            <HealthBar healthy={healthyCount} low={lowStockProducts.length} out={outOfStock.length} total={allProducts.length} />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {healthyCount} healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {lowStockProducts.length} low
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                {outOfStock.length} out
              </span>
            </div>
          </div>
        )}

        {/* Search + Category Filter */}
        <div className="px-5 mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>
          {categories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Smart Sections */}
        {(outOfStock.length > 0 || reorderNow.length > 0 || deadStock.length > 0) && (
          <div className="mb-2">
            <div className="px-5 mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Attention Needed</h2>
                {alertCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{alertCount}</span>
                )}
              </div>
            </div>
            <div className="bg-white border-y border-gray-100 shadow-sm">
              {outOfStock.length > 0 && (
                <CollapsibleSection
                  title="Out of Stock"
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  count={outOfStock.length}
                  severity="critical"
                  defaultOpen
                >
                  {outOfStock.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={velocities[p.id]} />
                  ))}
                </CollapsibleSection>
              )}
              {reorderNow.length > 0 && (
                <CollapsibleSection
                  title="Reorder Soon"
                  icon={<Package className="w-3.5 h-3.5" />}
                  count={reorderNow.length}
                  severity="warning"
                  defaultOpen={outOfStock.length === 0}
                >
                  {reorderNow.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={velocities[p.id]} />
                  ))}
                </CollapsibleSection>
              )}
              {deadStock.length > 0 && (
                <CollapsibleSection
                  title="Slow Movers"
                  icon={<TrendingDown className="w-3.5 h-3.5" />}
                  count={deadStock.length}
                  severity="info"
                  defaultOpen={false}
                >
                  {deadStock.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onUpdateStock={handleUpdateStock} velocity={0} />
                  ))}
                </CollapsibleSection>
              )}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="px-5 mt-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            <span className="ml-2 font-semibold text-gray-400 normal-case tracking-normal">({displayProducts.length})</span>
          </h2>
          <div className="space-y-2">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onUpdateStock={handleUpdateStock}
                velocity={velocities[product.id]}
              />
            ))}
          </div>
          {displayProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {allProducts.length === 0 ? 'No products yet' : 'No products match your search'}
              </p>
              {allProducts.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Tap "Add" to create your first product</p>
              )}
            </div>
          )}
        </div>
      </div>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
    </Layout>
  );
}
