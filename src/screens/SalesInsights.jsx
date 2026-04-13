import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { SalesChart } from '../components/sales/SalesChart';
import { TopProducts } from '../components/sales/TopProducts';
import { useSales } from '../hooks/useSales';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SalesInsights() {
  const { sales } = useSales();
  const [viewMode, setViewMode] = useState('daily');

  const dailyData = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - now.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(dayStart); d.setDate(dayStart.getDate() + i);
      return { date: d, label: DAY_NAMES[d.getDay()], sales: 0, profit: 0, items: 0 };
    });
    sales.forEach((s) => {
      const sDate = new Date(s.created_at);
      const dayIndex = days.findIndex((d) => d.date.toDateString() === sDate.toDateString());
      if (dayIndex >= 0) { days[dayIndex].sales += Number(s.total_amount); days[dayIndex].profit += Number(s.profit); days[dayIndex].items += s.quantity; }
    });
    return days;
  }, [sales]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const ms = sales.filter((s) => { const sd = new Date(s.created_at); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear(); });
      return { label: MONTH_NAMES[d.getMonth()], sales: ms.reduce((sum, s) => sum + Number(s.total_amount), 0), profit: ms.reduce((sum, s) => sum + Number(s.profit), 0) };
    });
  }, [sales]);

  const bestDay = useMemo(() => dailyData.reduce((prev, cur) => (cur.profit > prev.profit ? cur : prev), dailyData[0]), [dailyData]);

  const topProducts = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      if (!map[s.product_name]) map[s.product_name] = { name: s.product_name, sold: 0, revenue: 0 };
      map[s.product_name].sold += s.quantity; map[s.product_name].revenue += Number(s.total_amount);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  const chartData = viewMode === 'daily' ? dailyData : monthlyData;

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales Insights</h1>
          <p className="text-sm text-gray-500">Track your performance</p>
        </div>
        <div className="px-5 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Award className="w-5 h-5" /></div>
              <span className="text-sm font-medium opacity-90">Best Day This Week</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold mb-1">{bestDay?.label || '—'}</div>
                <div className="text-sm opacity-90">₹{bestDay?.profit.toLocaleString('en-IN') || 0} profit</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₹{bestDay?.sales.toLocaleString('en-IN') || 0}</div>
                <div className="text-xs opacity-90">{bestDay?.items || 0} items sold</div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="px-5 mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('daily')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>Daily Sales</button>
            <button onClick={() => setViewMode('monthly')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>Monthly Sales</button>
          </div>
        </div>
        <motion.div key={viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{viewMode === 'daily' ? 'This Week — Sales' : 'Last 6 Months — Sales'}</h2>
            <SalesChart data={chartData} dataKey="sales" fill="#3b82f6" type={viewMode === 'daily' ? 'bar' : 'line'} label="Sales" />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{viewMode === 'daily' ? 'This Week — Profit' : 'Last 6 Months — Profit'}</h2>
            <SalesChart data={chartData} dataKey="profit" fill="#10b981" type={viewMode === 'daily' ? 'bar' : 'line'} label="Profit" />
          </div>
        </motion.div>
        <div className="px-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <TopProducts products={topProducts} />
        </div>
      </div>
    </Layout>
  );
}
