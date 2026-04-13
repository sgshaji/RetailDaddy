import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Receipt, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { useSales } from '../hooks/useSales';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

function Trend({ change }) {
  if (change === null) return null;
  const isPositive = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(change).toFixed(0)}%
    </span>
  );
}

function SummaryCard({ icon, label, value, change }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900 tabular-nums leading-tight">{value}</p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-xs text-gray-500">{label}</p>
        <Trend change={change} />
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        <ShoppingBag className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      <p className="text-xs text-gray-400 mt-1">Record some sales to see insights</p>
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
      const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, sales: 0, profit: 0 }));
      filtered.forEach(s => { const h = new Date(s.created_at).getHours(); hours[h].sales += Number(s.total_amount); hours[h].profit += Number(s.profit); });
      chartData = hours.filter((_, i) => i >= 8 && i <= 21);
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

    const productMap = {};
    filtered.forEach(s => {
      if (!productMap[s.product_name]) productMap[s.product_name] = { name: s.product_name, sold: 0, revenue: 0, profit: 0 };
      productMap[s.product_name].sold += s.quantity;
      productMap[s.product_name].revenue += Number(s.total_amount);
      productMap[s.product_name].profit += Number(s.profit);
    });
    const bestSellers = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    sales.forEach(s => { const d = new Date(s.created_at).getDay(); dayTotals[d] += Number(s.total_amount); dayCount[d]++; });
    const dayAvgs = dayTotals.map((t, i) => ({
      day: DAY_NAMES_SHORT[i],
      dayFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
      avg: dayCount[i] > 0 ? t / Math.max(1, Math.ceil(sales.length > 0 ? 30 / 7 : 1)) : 0,
    }));
    const busiestDay = dayAvgs.reduce((b, d) => d.avg > b.avg ? d : b, dayAvgs[0]);
    const margin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : '0.0';

    return {
      revenue, profit, transactions, avgTransaction, margin,
      revenueChange: pct(revenue, prevRevenue),
      profitChange: pct(profit, prevProfit),
      transactionChange: pct(transactions, prevTransactions),
      avgTransactionChange: pct(avgTransaction, prevAvgTransaction),
      bestSellers, chartData, busiestDay, dayAvgs,
      hasData: filtered.length > 0,
    };
  }, [sales, period]);

  const periodLabels = { today: 'Today', week: 'This Week', month: 'This Month' };

  return (
    <Layout>
      <div className="pb-28">
        {/* Header */}
        <div className="px-5 pt-10 pb-5">
          <h1 className="text-2xl font-bold text-gray-900">Sales Insights</h1>
          <p className="text-sm text-gray-400 mt-0.5">Understand your business performance</p>
        </div>

        {/* Period Selector */}
        <div className="px-5 mb-5">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
            {['today', 'week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {!stats.hasData ? (
          <EmptyState message={`No sales data for ${periodLabels[period].toLowerCase()}`} />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-6">
              <SummaryCard
                icon={<DollarSign className="w-4 h-4" />}
                label="Revenue"
                value={formatCurrency(stats.revenue)}
                change={stats.revenueChange}
              />
              <SummaryCard
                icon={<TrendingUp className="w-4 h-4" />}
                label={`Profit · ${stats.margin}%`}
                value={formatCurrency(stats.profit)}
                change={stats.profitChange}
              />
              <SummaryCard
                icon={<Receipt className="w-4 h-4" />}
                label="Transactions"
                value={String(stats.transactions)}
                change={stats.transactionChange}
              />
              <SummaryCard
                icon={<Tag className="w-4 h-4" />}
                label="Avg. Sale"
                value={formatCurrency(stats.avgTransaction)}
                change={stats.avgTransactionChange}
              />
            </div>

            {/* Revenue Chart */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-900">Revenue &amp; Profit</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Rev</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Profit</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.chartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Revenue" maxBarSize={28} />
                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Sales Patterns */}
            <div className="px-5 mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sales Patterns</h2>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Busiest day: {stats.busiestDay.dayFull}</p>
                    <p className="text-xs text-gray-400">Avg. {formatCurrency(stats.busiestDay.avg)} revenue</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Revenue by day of week</p>
                  <div className="flex gap-1.5">
                    {stats.dayAvgs.map(d => {
                      const maxAvg = Math.max(...stats.dayAvgs.map(x => x.avg), 1);
                      const intensity = d.avg / maxAvg;
                      const isBusiest = d.day === stats.busiestDay.day;
                      return (
                        <div key={d.day} className="flex-1 text-center">
                          <div
                            className={`h-9 rounded-lg transition-all ${isBusiest ? 'ring-2 ring-amber-500/40' : ''}`}
                            style={{ backgroundColor: `rgba(217, 119, 6, ${Math.max(intensity * 0.85, 0.06)})` }}
                          />
                          <p className={`text-[10px] mt-1 font-medium ${isBusiest ? 'text-amber-700' : 'text-gray-400'}`}>
                            {d.day}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="px-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Best Sellers — {periodLabels[period]}
              </h2>
              {stats.bestSellers.length > 0 ? (
                <div className="space-y-2">
                  {stats.bestSellers.map((product, index) => {
                    const maxSold = stats.bestSellers[0]?.sold || 1;
                    const margin = product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(0) : 0;
                    return (
                      <motion.div
                        key={product.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate mr-2">{product.name}</p>
                              <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(product.revenue)}</p>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-gray-400">{product.sold} sold</p>
                              <p className="text-xs font-semibold text-emerald-600">{margin}% margin</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1">
                              <div
                                className="bg-amber-400 h-1 rounded-full"
                                style={{ width: `${(product.sold / maxSold) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No sales data for this period" />
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
