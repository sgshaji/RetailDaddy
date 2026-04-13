import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/client';
import * as db from '../supabase/database';

export function useProducts(searchQuery = '') {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    db.fetchProducts(user.id).then(setProducts).catch(console.error);
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` }, () => {
        db.fetchProducts(user.id).then(setProducts).catch(console.error);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
  }, [products, searchQuery]);

  const lowStockProducts = useMemo(() => products.filter((p) => p.current_stock <= p.low_stock_threshold), [products]);

  const addProduct = useCallback(async (product) => {
    if (!user) throw new Error('Not authenticated');
    return db.addProduct(user.id, product);
  }, [user]);

  const updateStock = useCallback(async (productId, newStock) => {
    return db.updateProductStock(productId, newStock);
  }, []);

  return { products: filteredProducts, allProducts: products, lowStockProducts, addProduct, updateStock };
}
