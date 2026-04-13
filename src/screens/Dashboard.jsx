import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, Package, PartyPopper, ShoppingBag, ArrowRight, Plus } from 'lucide-react';
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
    <div className="flex items-end gap-0.5 h-10">
      {data.map((val, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm transition-all ${i === data.length - 1 ? 'bg-amber-600' : 'bg-amber-200'}`}
          style={{ height: `${Math.max((val / max) * 100, 6)}%` }}
        />
      ))}
    </div>
  );
}

function StatPill({ isPositive, value }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function AlertCard({ alert }) {
  const icons = {
    low_stock: <Package className="w-4 h-4" />,
    out_of_stock: <AlertTriangle className="w-4 h-4" />,
    dead_stock: <ShoppingBag className="w-4 h-4" />,
    milestone: <PartyPopper className="w-4 h-4" />,
  };
  const styles = {
    critical: { wrap: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', title: 'text-red-800', detail: 'text-red-600/80' },
    warning: { wrap: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100 text-amber-700', title: 'text-amber-900', detail: 'text-amber-700/70' },
    info: { wrap: 'bg-sky-50 border-sky-100', icon: 'bg-sky-100 text-sky-600', title: 'text-sky-900', detail: 'text-sky-700/70' },
    celebration: { wrap: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-900', detail: 'text-emerald-700/70' },
  };
  const s = styles[alert.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl p-3.5 border flex items-center gap-3 ${s.wrap}`}
    >
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}>
        {icons[alert.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${s.title}`}>{alert.title}</p>
        <p className={`text-xs mt-0.5 ${s.detail}`}>{alert.detail}</p>
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
      <div className="pb-28">
        {/* Header */}
        <div className="px-5 pt-10 pb-1">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Artisans Pottery</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{stats.greeting}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{today}</p>
          </motion.div>
        </div>

        {/* Today's Pulse */}
        <div className="px-5 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-3xl p-5 shadow-lg shadow-amber-700/20"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-widest">Today's Pulse</span>
              <StatPill isPositive={isPositive} value={stats.revenueVsAvg} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-3xl font-bold text-white tabular-nums leading-none">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-amber-300 mt-1.5 font-medium">Revenue</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300 tabular-nums leading-none">{formatCurrency(stats.todayProfit)}</p>
                <p className="text-xs text-amber-300 mt-1.5 font-medium">Profit</p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 pt-4 border-t border-amber-600/40">
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">{stats.todayTransactions}</p>
                <p className="text-xs text-amber-300 mt-0.5 font-medium">Sales today</p>
              </div>
              <div className="flex-1 max-w-[120px]">
                <p className="text-[10px] text-amber-400 mb-1.5 text-right">7-day trend</p>
                <MiniSparkline data={stats.last7Days} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* This Week's Stars */}
        {stats.weekTopProducts.length > 0 && (
          <div className="mt-7">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Top Sellers This Week</h2>
              <Link to="/sales" className="flex items-center gap-1 text-xs text-amber-700 font-semibold">
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {stats.weekTopProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.07 }}
                  className="flex-shrink-0 w-44 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">#{index + 1}</span>
                    {product.stock <= 5 && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Low</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{product.sold} sold</p>
                  <p className="text-base font-bold text-gray-900 mt-1 tabular-nums">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-400 mt-1">{product.stock} in stock</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {stats.alerts.length > 0 && (
          <div className="px-5 mt-7">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Needs Attention</h2>
              <span className="text-xs font-bold text-white bg-red-500 w-5 h-5 rounded-full flex items-center justify-center">{stats.alerts.length}</span>
            </div>
            <div className="space-y-2">
              {stats.alerts.slice(0, 4).map((alert, i) => (
                <AlertCard key={i} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mt-7">
          <RecentTransactions transactions={stats.recentTransactions} />
        </div>

        {/* Empty state */}
        {sales.length === 0 && stats.alerts.length === 0 && (
          <div className="px-5 mt-10 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">No sales recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap the + button to record your first sale</p>
          </div>
        )}
      </div>

      <RecordSaleSheet products={allProducts} onRecordSale={recordSale} />
    </Layout>
  );
}
