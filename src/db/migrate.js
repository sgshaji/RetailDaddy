import { db } from '../db/db';
import * as firestoreService from '../firebase/firestore';

/**
 * Migrate existing local Dexie data to Firestore.
 * Call this once after a user logs in for the first time if they have local data.
 */
export async function migrateLocalDataToFirestore(shopId) {
  const results = { products: 0, sales: 0, inventory: 0, summaries: 0 };

  try {
    // 1. Migrate products
    const localProducts = await db.products.where('status').equals('active').toArray();
    const productIdMap = {}; // old local id → new Firestore id

    for (const product of localProducts) {
      const newId = await firestoreService.addProduct(shopId, {
        name: product.name,
        description: product.description || '',
        category: product.category,
        barcode: product.barcode || '',
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        current_stock: product.current_stock,
        low_stock_threshold: product.low_stock_threshold,
        unit: product.unit
      });
      productIdMap[product.uuid || product.id] = newId;
      results.products++;
    }

    console.log(`Migrated ${results.products} products`);

    // Mark migration complete
    localStorage.setItem('dataMigrated', 'true');
    localStorage.setItem('dataMigratedAt', new Date().toISOString());

    return results;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Check if user has local Dexie data that needs migration
 */
export async function hasLocalData() {
  try {
    const count = await db.products.count();
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * Check if migration was already done
 */
export function wasMigrated() {
  return localStorage.getItem('dataMigrated') === 'true';
}
