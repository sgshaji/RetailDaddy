import { useMemo } from 'react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isSameDay(d1, d2) {
  return d1.toDateString() === d2.toDateString();
}

function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useDashboardStats(sales, products) {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = getWeekStart();

    // --- Time filters ---
    const todaySales = sales.filter(s => isSameDay(new Date(s.created_at), now));
    const thisWeekSales = sales.filter(s => new Date(s.created_at) >= weekStart);
    const thisMonthSales = sales.filter(s => {
      const d = new Date(s.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // --- Today's metrics ---
    const todayRevenue = todaySales.reduce((s, x) => s + Number(x.total_amount), 0);
    const todayProfit = todaySales.reduce((s, x) => s + Number(x.profit), 0);
    const todayItemsSold = todaySales.reduce((s, x) => s + x.quantity, 0);
    const todayTransactions = todaySales.length;

    // --- Daily average (last 30 days) ---
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30Sales = sales.filter(s => new Date(s.created_at) >= thirtyDaysAgo);
    const last30Revenue = last30Sales.reduce((s, x) => s + Number(x.total_amount), 0);
    const dailyAvgRevenue = last30Revenue / 30;

    // --- Last 7 days sparkline ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const daySales = sales.filter(s => isSameDay(new Date(s.created_at), d));
      return daySales.reduce((s, x) => s + Number(x.total_amount), 0);
    });

    // --- This week's top products ---
    const weekProductMap = {};
    thisWeekSales.forEach(s => {
      if (!weekProductMap[s.product_name]) {
        weekProductMap[s.product_name] = { name: s.product_name, product_id: s.product_id, sold: 0, revenue: 0 };
      }
      weekProductMap[s.product_name].sold += s.quantity;
      weekProductMap[s.product_name].revenue += Number(s.total_amount);
    });
    const weekTopProducts = Object.values(weekProductMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => {
        const product = products.find(pr => pr.id === p.product_id);
        return { ...p, stock: product?.current_stock ?? 0 };
      });

    // --- Sales velocity per product (avg units/week over last 30 days) ---
    const velocityMap = {};
    last30Sales.forEach(s => {
      if (!velocityMap[s.product_id]) velocityMap[s.product_id] = 0;
      velocityMap[s.product_id] += s.quantity;
    });
    const productVelocities = {};
    Object.entries(velocityMap).forEach(([id, qty]) => {
      productVelocities[id] = qty / 4.3; // ~4.3 weeks in 30 days
    });

    // --- Smart alerts ---
    const alerts = [];

    // Low stock with velocity context
    products.forEach(p => {
      const velocity = productVelocities[p.id] || 0;
      const daysOfStock = velocity > 0 ? Math.floor((p.current_stock / velocity) * 7) : 999;
      if (p.current_stock <= p.low_stock_threshold && p.current_stock > 0) {
        alerts.push({
          type: 'low_stock',
          severity: 'warning',
          title: `Low stock: ${p.name}`,
          detail: velocity > 0
            ? `${p.current_stock} left, sells ~${velocity.toFixed(0)}/week. ~${daysOfStock} days remaining.`
            : `${p.current_stock} left — below your restock threshold of ${p.low_stock_threshold}.`,
          productId: p.id,
        });
      }
      if (p.current_stock === 0) {
        alerts.push({
          type: 'out_of_stock',
          severity: 'critical',
          title: `Out of stock: ${p.name}`,
          detail: velocity > 0 ? `Was selling ~${velocity.toFixed(0)}/week. You're losing sales.` : 'No stock remaining.',
          productId: p.id,
        });
      }
    });

    // Dead stock (no sales in 30 days, still has stock)
    const deadStock = products.filter(p => {
      const hasSales = last30Sales.some(s => s.product_id === p.id);
      return !hasSales && p.current_stock > 0;
    });
    if (deadStock.length > 0) {
      const totalValue = deadStock.reduce((s, p) => s + p.price * p.current_stock, 0);
      alerts.push({
        type: 'dead_stock',
        severity: 'info',
        title: `${deadStock.length} items haven't sold in 30 days`,
        detail: `₹${totalValue.toLocaleString('en-IN')} in inventory sitting idle. Consider a markdown?`,
        items: deadStock,
      });
    }

    // Month milestone
    const mtdRevenue = thisMonthSales.reduce((s, x) => s + Number(x.total_amount), 0);
    const milestones = [500000, 200000, 100000, 50000];
    for (const m of milestones) {
      if (mtdRevenue >= m) {
        alerts.push({
          type: 'milestone',
          severity: 'celebration',
          title: `You've crossed ₹${(m / 1000).toFixed(0)}K this month!`,
          detail: `Month-to-date: ₹${mtdRevenue.toLocaleString('en-IN')}. Keep it up!`,
        });
        break;
      }
    }

    // --- Busiest day ---
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    last30Sales.forEach(s => {
      const day = new Date(s.created_at).getDay();
      dayTotals[day] += Number(s.total_amount);
      dayCounts[day]++;
    });
    const dayAverages = dayTotals.map((total, i) => ({ day: DAY_NAMES[i], avg: dayCounts[i] > 0 ? total / (30 / 7) : 0 }));
    const busiestDay = dayAverages.reduce((best, d) => d.avg > best.avg ? d : best, dayAverages[0]);

    return {
      greeting: getGreeting(),
      todayRevenue,
      todayProfit,
      todayItemsSold,
      todayTransactions,
      revenueVsAvg: pct(todayRevenue, dailyAvgRevenue),
      dailyAvgRevenue,
      last7Days,
      weekTopProducts,
      alerts,
      recentTransactions: sales.slice(0, 10),
      mtdRevenue,
      productVelocities,
      busiestDay,
      dayAverages,
      deadStock,
    };
  }, [sales, products]);
}
