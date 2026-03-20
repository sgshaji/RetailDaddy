import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../firebase/firestore';

export function useInventory() {
  const { shopId } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!shopId) return;
    const unsubscribe = firestoreService.subscribeInventoryTransactions(shopId, setTransactions);
    return unsubscribe;
  }, [shopId]);

  const addStockIn = useCallback(async (productId, quantity, unitCost, reason = '') => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.addStockIn(shopId, productId, quantity, unitCost, reason);
  }, [shopId]);

  const addStockOut = useCallback(async (productId, quantity, reason = '') => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.addStockOut(shopId, productId, quantity, reason);
  }, [shopId]);

  const adjustStock = useCallback(async (productId, newQuantity, reason = '') => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.adjustStock(shopId, productId, newQuantity, reason);
  }, [shopId]);

  return {
    transactions,
    addStockIn,
    addStockOut,
    adjustStock
  };
}
