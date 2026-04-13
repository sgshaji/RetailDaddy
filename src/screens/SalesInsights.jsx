import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Receipt, Tag } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { useSales } from '../hooks/useSales';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

function SummaryCard({ icon, label, value, change }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">{icon}</div>
      </div>
      <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500">{label}</p>
        {change !== null && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function SalesInsights() {
  const { sales } = useSales();
  const [period, setPeriod] = useState('week');

  const stats = useMemo(() => {
    const now = new Date();
    let filtered = [];
    let prevFiltered = [];
    let chartData = [];

    if (period === 'today') {
      filtered = sales.filter(s => new Date(s.created_at).toDateString() === now.toDateString());
      const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
      prevFiltered = sales.filter(s => new Date(s.created_at).toDateString() === yesterday.toDateString());
      // Hourly chart
      const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, sales: 0, profit: 0 }));
      filtered.forEach(s => { const h = new Date(s.created_at).getHours(); hours[h].sales += Number(s.total_amount); hours[h].profit += Number(s.profit); });
      chartData = hours.filter((_, i) => i >= 8 && i <= 21); // Business hours
    } else if (period === 'week') {
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
      const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      filtered = sales.filter(s => new Date(s.created_at) >= weekStart);
      prevFiltered = sales.filter(s => { const d = new Date(s.created_at); return d >= prevWeekStart && d < weekStart; });
      chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
        const daySales = filtered.filter(s => new Date(s.created_at).toDateString() === d.toDateString());
        return { label: DAY_NAMES_SHORT[d.getDay()], sales: daySales.reduce((s, x) => s + Number(x.total_amount), 0), profit: daySales.reduce((s, x) => s + Number(x.profit), 0) };
      });
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = sales.filter(s => new Date(s.created_at) >= monthStart);
      prevFiltered = sales.filter(s => { const d = new Date(s.created_at); return d >= prevMonthStart && d < monthStart; });
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      chartData = Array.from({ length: Math.min(now.getDate(), daysInMonth) }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
        const daySales = filtered.filter(s => new Date(s.created_at).toDateString() === d.toDateString());
        return { label: String(i + 1), sales: daySales.reduce((s, x) => s + Number(x.total_amount), 0), profit: daySales.reduce((s, x) => s + Number(x.profit), 0) };
      });
    }

    const revenue = filtered.reduce((s, x) => s + Number(x.total_amount), 0);
    const prevRevenue = prevFiltered.reduce((s, x) => s + Number(x.total_amount), 0);
    const profit = filtered.reduce((s, x) => s + Number(x.profit), 0);
    const prevProfit = prevFiltered.reduce((s, x) => s + Number(x.profit), 0);
    const transactions = filtered.length;
    const prevTransactions = prevFiltered.length;
    const avgTransaction = transactions > 0 ? revenue / transactions : 0;
    const prevAvgTransaction = prevTransactions > 0 ? prevRevenue / prevTransactions : 0;

    // Best sellers
    const productMap = {};
    filtered.forEach(s => {
      if (!productMap[s.product_name]) productMap[s.product_name] = { name: s.product_name, sold: 0, revenue: 0, profit: 0 };
      productMap[s.product_name].sold += s.quantity;
      productMap[s.product_name].revenue += Number(s.total_amount);
      productMap[s.product_name].profit += Number(s.profit);
    });
    const bestSellers = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Busiest day pattern (from all sales)
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    sales.forEach(s => { const d = new Date(s.created_at).getDay(); dayTotals[d] += Number(s.total_amount); dayCount[d]++; });
    const dayAvgs = dayTotals.map((t, i) => ({ day: DAY_NAMES_SHORT[i], dayFull: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i], avg: dayCount[i] > 0 ? t / Math.max(1, Math.ceil(sales.length > 0 ? 30 / 7 : 1)) : 0 }));
    const busiestDay = dayAvgs.reduce((b, d) => d.avg > b.avg ? d : b, dayAvgs[0]);

    const margin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : '0.0';

    return {
      revenue, profit, transactions, avgTransaction, margin,
      revenueChange: pct(revenue, prevRevenue),
      profitChange: pct(profit, prevProfit),
      transactionChange: pct(transactions, prevTransactions),
      avgTransactionChange: pct(avgTransaction, prevAvgTransaction),
      bestSellers, chartData, busiestDay, dayAvgs,
    };
  }, [sales, period]);

  const periodLabels = { today: 'Today', week: 'This Week', month: 'This Month' };

  return (
    <Layout>
      <div className="pb-24">
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-2xl font-bold text-amber-900">Sales Insights</h1>
          <p className="text-sm text-gray-400 mt-0.5">Understand your business</p>
        </div>

        {/* Period Selector */}
        <div className="px-5 mt-4">
          <div className="flex gap-1 bg-amber-100/50 p-1 rounded-xl">
            {['today', 'week', 'month'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white text-amber-800 shadow-sm' : 'text-amber-700/60'}`}>
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <SummaryCard icon={<DollarSign className="w-4 h-4" />} label="Revenue" value={formatCurrency(stats.revenue)} change={stats.revenueChange} />
          <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label={`Profit (${stats.margin}%)`} value={formatCurrency(stats.profit)} change={stats.profitChange} />
          <SummaryCard icon={<Receipt className="w-4 h-4" />} label="Transactions" value={String(stats.transactions)} change={stats.transactionChange} />
          <SummaryCard icon={<Tag className="w-4 h-4" />} label="Avg. Transaction" value={formatCurrency(stats.avgTransaction)} change={stats.avgTransactionChange} />
        </div>

        {/* Revenue Chart */}
        {stats.chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue &amp; Profit</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                  <Bar dataKey="sales" fill="#d97706" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="profit" fill="#059669" radius={[6, 6, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Sales Patterns */}
        <div className="px-5 mt-6">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Sales Patterns</h2>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 text-sm">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Busiest day: {stats.busiestDay.dayFull}</p>
                <p className="text-xs text-gray-500">Avg. {formatCurrency(stats.busiestDay.avg)} revenue</p>
              </div>
            </div>
            {stats.avgTransaction > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 text-sm">🏷️</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Avg. transaction: {formatCurrency(stats.avgTransaction)}</p>
                  <p className="text-xs text-gray-500">{stats.avgTransactionChange >= 0 ? 'Up' : 'Down'} {Math.abs(stats.avgTransactionChange).toFixed(0)}% vs previous period</p>
                </div>
              </div>
            )}
            {/* Day of week heatmap */}
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">Revenue by day of week</p>
              <div className="flex gap-1">
                {stats.dayAvgs.map(d => {
                  const maxAvg = Math.max(...stats.dayAvgs.map(x => x.avg), 1);
                  const intensity = d.avg / maxAvg;
                  return (
                    <div key={d.day} className="flex-1 text-center">
                      <div className="h-8 rounded-md transition-all" style={{ backgroundColor: `rgba(217, 119, 6, ${Math.max(intensity * 0.8, 0.05)})` }} />
                      <p className="text-[10px] text-gray-400 mt-1">{d.day}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="px-5 mt-6">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Best Sellers — {periodLabels[period]}</h2>
          {stats.bestSellers.length > 0 ? (
            <div className="space-y-2">
              {stats.bestSellers.map((product, index) => {
                const maxSold = stats.bestSellers[0]?.sold || 1;
                const margin = product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(0) : 0;
                return (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm font-bold text-gray-900 ml-2">{formatCurrency(product.revenue)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{product.sold} sold</p>
                          <p className="text-xs text-emerald-600 font-medium">{margin}% margin</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(product.sold / maxSold) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No sales data for this period</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
