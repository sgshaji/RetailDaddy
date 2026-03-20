import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../firebase/firestore';

export function useProducts(filter = {}) {
  const { shopId } = useAuth();
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    if (!shopId) return;
    const unsubscribe = firestoreService.subscribeProducts(shopId, setAllProducts);
    return unsubscribe;
  }, [shopId]);

  // Apply client-side filters
  const products = useMemo(() => {
    let result = allProducts;

    if (filter.category && filter.category !== 'All') {
      result = result.filter(p => p.category === filter.category);
    }

    if (filter.lowStock) {
      result = result.filter(p => p.current_stock <= p.low_stock_threshold);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [allProducts, filter.category, filter.lowStock, filter.search]);

  const addProduct = useCallback(async (product) => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.addProduct(shopId, product);
  }, [shopId]);

  const updateProduct = useCallback(async (id, changes) => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.updateProduct(shopId, id, changes);
  }, [shopId]);

  const deleteProduct = useCallback(async (id) => {
    if (!shopId) throw new Error('Not authenticated');
    return firestoreService.deleteProduct(shopId, id);
  }, [shopId]);

  const getProductById = useCallback(async (id) => {
    if (!shopId) return null;
    return firestoreService.getProduct(shopId, id);
  }, [shopId]);

  const lowStockProducts = useMemo(() => {
    return allProducts.filter(p => p.current_stock <= p.low_stock_threshold);
  }, [allProducts]);

  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map(p => p.category))];
    return cats.sort();
  }, [allProducts]);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    lowStockProducts,
    categories
  };
}
