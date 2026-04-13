import { DollarSign, ShoppingCart, Percent, Calendar, TrendingUp, Package } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { RecordSaleSheet } from '../components/dashboard/RecordSaleSheet';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { useDashboardStats } from '../hooks/useDashboardStats';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function Dashboard() {
  const { sales, recordSale } = useSales();
  const { allProducts, lowStockProducts } = useProducts();
  const stats = useDashboardStats(sales, lowStockProducts.length);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Today's Performance</h2>
          <div className="space-y-3">
            <MetricCard label="Revenue" value={formatCurrency(stats.todayRevenue)} change={stats.revenueChange} icon={<DollarSign className="w-5 h-5" />} subtitle="vs. yesterday" />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Items Sold" value={String(stats.todayItemsSold)} change={stats.itemsSoldChange} icon={<ShoppingCart className="w-5 h-5" />} />
              <MetricCard label="Profit" value={formatCurrency(stats.todayProfit)} change={stats.profitChange} icon={<Percent className="w-5 h-5" />} />
            </div>
          </div>
        </div>
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{currentMonth}</h2>
          <div className="space-y-3">
            <MetricCard label="Month to Date Sales" value={formatCurrency(stats.mtdSales)} change={stats.mtdSalesChange} icon={<Calendar className="w-5 h-5" />} subtitle={`${stats.daysElapsed} days elapsed`} />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="MTD Profit" value={formatCurrency(stats.mtdProfit)} change={stats.mtdProfitChange} icon={<TrendingUp className="w-5 h-5" />} />
              <MetricCard label="Low Stock" value={String(stats.lowStockCount)} change={0} icon={<Package className="w-5 h-5" />} />
            </div>
          </div>
        </div>
        <RecentTransactions transactions={stats.recentTransactions} />
      </div>
      <RecordSaleSheet products={allProducts} onRecordSale={recordSale} />
    </Layout>
  );
}
