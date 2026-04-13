import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/client';
import * as db from '../supabase/database';

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (!user) return;
    db.fetchSales(user.id).then(setSales).catch(console.error);
    const channel = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales', filter: `user_id=eq.${user.id}` }, () => {
        db.fetchSales(user.id).then(setSales).catch(console.error);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const recordSale = useCallback(async (saleData) => {
    if (!user) throw new Error('Not authenticated');
    return db.createSale(user.id, saleData);
  }, [user]);

  return { sales, recordSale };
}
