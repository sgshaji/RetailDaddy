import { useMemo } from 'react';

function isToday(dateStr) { return new Date(dateStr).toDateString() === new Date().toDateString(); }
function isYesterday(dateStr) { const y = new Date(); y.setDate(y.getDate() - 1); return new Date(dateStr).toDateString() === y.toDateString(); }
function isCurrentMonth(dateStr) { const d = new Date(dateStr); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }
function isLastMonth(dateStr) { const d = new Date(dateStr); const l = new Date(); l.setMonth(l.getMonth() - 1); return d.getMonth() === l.getMonth() && d.getFullYear() === l.getFullYear(); }
function pct(cur, prev) { if (prev === 0) return cur > 0 ? 100 : 0; return ((cur - prev) / prev) * 100; }

export function useDashboardStats(sales, lowStockCount) {
  return useMemo(() => {
    const todaySales = sales.filter((s) => isToday(s.created_at));
    const yesterdaySales = sales.filter((s) => isYesterday(s.created_at));
    const monthSales = sales.filter((s) => isCurrentMonth(s.created_at));
    const lastMonthSales = sales.filter((s) => isLastMonth(s.created_at));

    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const todayItemsSold = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const yesterdayItemsSold = yesterdaySales.reduce((sum, s) => sum + s.quantity, 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit), 0);
    const yesterdayProfit = yesterdaySales.reduce((sum, s) => sum + Number(s.profit), 0);
    const mtdSales = monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const lastMtdSales = lastMonthSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const mtdProfit = monthSales.reduce((sum, s) => sum + Number(s.profit), 0);
    const lastMtdProfit = lastMonthSales.reduce((sum, s) => sum + Number(s.profit), 0);

    return {
      todayRevenue, revenueChange: pct(todayRevenue, yesterdayRevenue),
      todayItemsSold, itemsSoldChange: pct(todayItemsSold, yesterdayItemsSold),
      todayProfit, profitChange: pct(todayProfit, yesterdayProfit),
      mtdSales, mtdSalesChange: pct(mtdSales, lastMtdSales),
      mtdProfit, mtdProfitChange: pct(mtdProfit, lastMtdProfit),
      lowStockCount, daysElapsed: new Date().getDate(),
      recentTransactions: sales.slice(0, 10),
    };
  }, [sales, lowStockCount]);
}
