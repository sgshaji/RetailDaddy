import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../firebase/firestore';

export function useSales(dateFilter = null) {
  const { shopId } = useAuth();
  const [sales, setSales] = useState([]);
  const [todaySales, setTodaySales] = useState([]);

  useEffect(() => {
    if (!shopId) return;
    const unsubscribe = firestoreService.subscribeSales(shopId, setSales, dateFilter);
    return unsubscribe;
  }, [shopId, dateFilter]);

  // Subscribe to today's sales
  useEffect(() => {
    if (!shopId) return;
    const today = new Date().toISOString().split('T')[0];
    const unsubscribe = firestoreService.subscribeSales(shopId, setTodaySales, today);
    return unsubscribe;
  }, [shopId]);

  const createSale = useCallback(async (saleData) => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.createSale(shopId, saleData);
  }, [shopId]);

  const deleteSale = useCallback(async (saleId) => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.deleteSale(shopId, saleId);
  }, [shopId]);

  return {
    sales,
    todaySales,
    recentSales: sales.slice(0, 10),
    createSale,
    deleteSale
  };
}
