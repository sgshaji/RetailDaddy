import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Package, PartyPopper, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { RecordSaleSheet } from '../components/dashboard/RecordSaleSheet';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Link } from 'react-router-dom';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function MiniSparkline({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all ${i === data.length - 1 ? 'bg-amber-600' : 'bg-amber-200'}`}
          style={{ height: `${Math.max((val / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  );
}

function AlertCard({ alert }) {
  const icons = {
    low_stock: <Package className="w-5 h-5" />,
    out_of_stock: <AlertTriangle className="w-5 h-5" />,
    dead_stock: <ShoppingBag className="w-5 h-5" />,
    milestone: <PartyPopper className="w-5 h-5" />,
  };
  const colors = {
    critical: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    celebration: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl p-4 border flex items-start gap-3 ${colors[alert.severity]}`}
    >
      <span className="mt-0.5 opacity-70">{icons[alert.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{alert.title}</p>
        <p className="text-xs opacity-80 mt-0.5">{alert.detail}</p>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { sales, recordSale } = useSales();
  const { allProducts, lowStockProducts } = useProducts();
  const stats = useDashboardStats(sales, allProducts);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const isPositive = stats.revenueVsAvg >= 0;

  return (
    <Layout>
      <div className="pb-24">
        {/* Greeting */}
        <div className="px-5 pt-8 pb-2">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-amber-900">{stats.greeting}</h1>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-amber-700/70 font-medium">Artisans Pottery</p>
              <p className="text-sm text-gray-400">{today}</p>
            </div>
          </motion.div>
        </div>

        {/* Today's Pulse */}
        <div className="px-5 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Today's Pulse</h2>
              <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.revenueVsAvg).toFixed(0)}% vs avg
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.todayTransactions}</p>
                <p className="text-xs text-gray-500 mt-0.5">Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(stats.todayProfit)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Profit</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/60 flex items-center justify-between">
              <p className="text-xs text-gray-400">Last 7 days</p>
              <MiniSparkline data={stats.last7Days} />
            </div>
          </motion.div>
        </div>

        {/* This Week's Stars */}
        {stats.weekTopProducts.length > 0 && (
          <div className="mt-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">This Week's Stars</h2>
              <Link to="/sales" className="text-xs text-amber-600 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {stats.weekTopProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex-shrink-0 w-40 bg-white rounded-xl p-4 border shadow-sm ${
                    product.stock <= 5 ? 'border-amber-200' : 'border-gray-100'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-700 mb-1">#{index + 1}</div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.sold} sold &bull; {formatCurrency(product.revenue)}</p>
                  <div className={`text-xs mt-2 font-medium ${product.stock <= 5 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {product.stock <= 5 ? `⚠ ${product.stock} left` : `${product.stock} in stock`}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {stats.alerts.length > 0 && (
          <div className="px-5 mt-6">
            <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Needs Your Attention</h2>
            <div className="space-y-2">
              {stats.alerts.slice(0, 4).map((alert, i) => (
                <AlertCard key={i} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mt-6">
          <RecentTransactions transactions={stats.recentTransactions} />
        </div>

        {/* Empty state */}
        {sales.length === 0 && stats.alerts.length === 0 && (
          <div className="px-5 mt-8 text-center">
            <div className="text-4xl mb-3">🏺</div>
            <p className="text-lg font-semibold text-gray-700">No sales yet today</p>
            <p className="text-sm text-gray-400 mt-1">The kiln is warming up — tap + to record your first sale!</p>
          </div>
        )}
      </div>

      <RecordSaleSheet products={allProducts} onRecordSale={recordSale} />
    </Layout>
  );
}
