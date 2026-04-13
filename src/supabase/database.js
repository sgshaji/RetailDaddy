import { supabase } from './client';

// --- Products ---
export async function fetchProducts(userId) {
  const { data, error } = await supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addProduct(userId, product) {
  const { data, error } = await supabase.from('products').insert({ ...product, user_id: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function updateProductStock(productId, newStock) {
  const { error } = await supabase.from('products').update({ current_stock: newStock }).eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
}

// --- Sales ---
export async function fetchSales(userId) {
  const { data, error } = await supabase.from('sales').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSale(userId, sale) {
  const { data, error } = await supabase.from('sales').insert({ ...sale, user_id: userId }).select().single();
  if (error) throw error;
  // Decrement stock
  const { data: product } = await supabase.from('products').select('current_stock').eq('id', sale.product_id).single();
  if (product) {
    await updateProductStock(sale.product_id, product.current_stock - sale.quantity);
  }
  return data;
}

export async function deleteSale(saleId) {
  const { error } = await supabase.from('sales').delete().eq('id', saleId);
  if (error) throw error;
}
