import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../firebase/firestore';

export function useMonthSummaries(year, month) {
  const { shopId } = useAuth();
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    if (!shopId) return;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    const unsubscribe = firestoreService.subscribeDailySummariesRange(
      shopId, startDate, endDate, setSummaries
    );
    return unsubscribe;
  }, [shopId, year, month]);

  return summaries;
}

export function useDailySummary() {
  const { shopId } = useAuth();
  const [todaySummary, setTodaySummary] = useState({
    date: new Date().toISOString().split('T')[0],
    total_sales_amount: 0,
    total_profit: 0,
    sales_count: 0
  });
  const [weekSummaries, setWeekSummaries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Today's summary
  useEffect(() => {
    if (!shopId) return;
    const today = new Date().toISOString().split('T')[0];
    const unsubscribe = firestoreService.subscribeDailySummary(shopId, today, setTodaySummary);
    return unsubscribe;
  }, [shopId]);

  // Week summaries
  useEffect(() => {
    if (!shopId) return;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const unsubscribe = firestoreService.subscribeDailySummariesRange(
      shopId, startDate, endDate, setWeekSummaries
    );
    return unsubscribe;
  }, [shopId]);

  // Top products from recent sales (client-side aggregation)
  useEffect(() => {
    if (!shopId) return;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unsubscribe = firestoreService.subscribeSales(shopId, (sales) => {
      const productStats = {};
      sales.forEach(sale => {
        if (!productStats[sale.product_id]) {
          productStats[sale.product_id] = {
            product_id: sale.product_id,
            product_name: sale.product_name,
            total_quantity: 0,
            total_revenue: 0,
            total_profit: 0,
            sales_count: 0
          };
        }
        productStats[sale.product_id].total_quantity += sale.quantity;
        productStats[sale.product_id].total_revenue += sale.total_amount;
        productStats[sale.product_id].total_profit += sale.profit;
        productStats[sale.product_id].sales_count += 1;
      });

      const top = Object.values(productStats)
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
      setTopProducts(top);
    });
    return unsubscribe;
  }, [shopId]);

  return {
    todaySummary,
    weekSummaries,
    topProducts
  };
}
