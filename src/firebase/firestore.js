import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from './config';

/**
 * Get a reference to a shop's sub-collection.
 * All data is scoped under: shops/{shopId}/{collectionName}
 */
function shopCollection(shopId, collectionName) {
  return collection(firestore, 'shops', shopId, collectionName);
}

function shopDoc(shopId, collectionName, docId) {
  return doc(firestore, 'shops', shopId, collectionName, docId);
}

// ==================== PRODUCTS ====================

export function subscribeProducts(shopId, callback) {
  const q = query(
    shopCollection(shopId, 'products'),
    where('status', '==', 'active'),
    orderBy('name')
  );
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(products);
  });
}

export async function addProduct(shopId, product) {
  const ref = await addDoc(shopCollection(shopId, 'products'), {
    ...product,
    status: 'active',
    current_stock: product.current_stock || 0,
    low_stock_threshold: product.low_stock_threshold || 5,
    unit: product.unit || 'pieces',
    category: product.category || 'General',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateProduct(shopId, productId, changes) {
  await updateDoc(shopDoc(shopId, 'products', productId), {
    ...changes,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProduct(shopId, productId) {
  await updateDoc(shopDoc(shopId, 'products', productId), {
    status: 'inactive',
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function getProduct(shopId, productId) {
  const snap = await getDoc(shopDoc(shopId, 'products', productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ==================== SALES ====================

export function subscribeSales(shopId, callback, dateFilter = null) {
  let q;
  if (dateFilter) {
    const startOfDay = new Date(dateFilter);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateFilter);
    endOfDay.setHours(23, 59, 59, 999);

    q = query(
      shopCollection(shopId, 'sales'),
      where('status', '==', 'completed'),
      where('date', '>=', startOfDay.toISOString()),
      where('date', '<=', endOfDay.toISOString()),
      orderBy('date', 'desc')
    );
  } else {
    q = query(
      shopCollection(shopId, 'sales'),
      where('status', '==', 'completed'),
      orderBy('date', 'desc'),
      limit(100)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(sales);
  });
}

export async function createSale(shopId, saleData) {
  const productRef = shopDoc(shopId, 'products', saleData.product_id);

  return runTransaction(firestore, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = { id: productSnap.id, ...productSnap.data() };

    if (product.current_stock < saleData.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.current_stock}`);
    }

    const unit_price = saleData.unit_price || product.selling_price;
    const unit_cost = product.cost_price;
    const total_amount = unit_price * saleData.quantity;
    const profit = total_amount - (unit_cost * saleData.quantity);
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];

    // Create sale
    const saleRef = doc(shopCollection(shopId, 'sales'));
    transaction.set(saleRef, {
      product_id: product.id,
      product_name: product.name,
      quantity: saleData.quantity,
      unit_price,
      unit_cost,
      total_amount,
      profit,
      date: now,
      dateStr,
      payment_method: saleData.payment_method || 'cash',
      status: 'completed',
      createdAt: serverTimestamp()
    });

    // Update stock
    const new_stock = product.current_stock - saleData.quantity;
    transaction.update(productRef, {
      current_stock: new_stock,
      updatedAt: serverTimestamp()
    });

    // Create inventory transaction
    const invRef = doc(shopCollection(shopId, 'inventory_transactions'));
    transaction.set(invRef, {
      product_id: product.id,
      product_name: product.name,
      transaction_type: 'sale',
      quantity: -saleData.quantity,
      previous_stock: product.current_stock,
      new_stock,
      unit_cost,
      reference_id: saleRef.id,
      date: now,
      createdAt: serverTimestamp()
    });

    // Upsert daily summary
    const summaryRef = shopDoc(shopId, 'daily_summaries', dateStr);
    const summarySnap = await transaction.get(summaryRef);

    if (summarySnap.exists()) {
      const existing = summarySnap.data();
      transaction.update(summaryRef, {
        total_sales_amount: existing.total_sales_amount + total_amount,
        total_profit: existing.total_profit + profit,
        sales_count: existing.sales_count + 1,
        updatedAt: serverTimestamp()
      });
    } else {
      transaction.set(summaryRef, {
        date: dateStr,
        total_sales_amount: total_amount,
        total_profit: profit,
        sales_count: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return saleRef.id;
  });
}

export async function deleteSale(shopId, saleId) {
  const saleRef = shopDoc(shopId, 'sales', saleId);

  return runTransaction(firestore, async (transaction) => {
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) throw new Error('Sale not found');

    const sale = saleSnap.data();
    const productRef = shopDoc(shopId, 'products', sale.product_id);
    const productSnap = await transaction.get(productRef);

    if (productSnap.exists()) {
      const product = productSnap.data();
      const new_stock = product.current_stock + sale.quantity;

      transaction.update(productRef, {
        current_stock: new_stock,
        updatedAt: serverTimestamp()
      });

      // Create reversal inventory transaction
      const invRef = doc(shopCollection(shopId, 'inventory_transactions'));
      transaction.set(invRef, {
        product_id: sale.product_id,
        product_name: sale.product_name,
        transaction_type: 'return',
        quantity: sale.quantity,
        previous_stock: product.current_stock,
        new_stock,
        reason: 'Sale cancelled',
        reference_id: saleId,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
    }

    // Update daily summary
    const dateStr = sale.date.split('T')[0];
    const summaryRef = shopDoc(shopId, 'daily_summaries', dateStr);
    const summarySnap = await transaction.get(summaryRef);
    if (summarySnap.exists()) {
      const existing = summarySnap.data();
      transaction.update(summaryRef, {
        total_sales_amount: Math.max(0, existing.total_sales_amount - sale.total_amount),
        total_profit: existing.total_profit - sale.profit,
        sales_count: Math.max(0, existing.sales_count - 1),
        updatedAt: serverTimestamp()
      });
    }

    // Soft delete
    transaction.update(saleRef, {
      status: 'cancelled',
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
}

// ==================== INVENTORY ====================

export function subscribeInventoryTransactions(shopId, callback) {
  const q = query(
    shopCollection(shopId, 'inventory_transactions'),
    orderBy('date', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snapshot) => {
    const txns = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(txns);
  });
}

export async function addStockIn(shopId, productId, quantity, unitCost, reason = '') {
  const productRef = shopDoc(shopId, 'products', productId);

  return runTransaction(firestore, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = productSnap.data();
    const new_stock = product.current_stock + quantity;

    transaction.update(productRef, {
      current_stock: new_stock,
      updatedAt: serverTimestamp()
    });

    const invRef = doc(shopCollection(shopId, 'inventory_transactions'));
    transaction.set(invRef, {
      product_id: productId,
      product_name: product.name,
      transaction_type: 'stock_in',
      quantity,
      previous_stock: product.current_stock,
      new_stock,
      unit_cost: unitCost || product.cost_price,
      reason,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return new_stock;
  });
}

export async function addStockOut(shopId, productId, quantity, reason = '') {
  const productRef = shopDoc(shopId, 'products', productId);

  return runTransaction(firestore, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = productSnap.data();
    if (product.current_stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.current_stock}`);
    }

    const new_stock = product.current_stock - quantity;

    transaction.update(productRef, {
      current_stock: new_stock,
      updatedAt: serverTimestamp()
    });

    const invRef = doc(shopCollection(shopId, 'inventory_transactions'));
    transaction.set(invRef, {
      product_id: productId,
      product_name: product.name,
      transaction_type: 'stock_out',
      quantity: -quantity,
      previous_stock: product.current_stock,
      new_stock,
      reason,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return new_stock;
  });
}

export async function adjustStock(shopId, productId, newQuantity, reason = '') {
  const productRef = shopDoc(shopId, 'products', productId);

  return runTransaction(firestore, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error('Product not found');

    const product = productSnap.data();
    const difference = newQuantity - product.current_stock;

    transaction.update(productRef, {
      current_stock: newQuantity,
      updatedAt: serverTimestamp()
    });

    const invRef = doc(shopCollection(shopId, 'inventory_transactions'));
    transaction.set(invRef, {
      product_id: productId,
      product_name: product.name,
      transaction_type: 'adjustment',
      quantity: difference,
      previous_stock: product.current_stock,
      new_stock: newQuantity,
      reason,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return newQuantity;
  });
}

// ==================== DAILY SUMMARIES ====================

export function subscribeDailySummary(shopId, dateStr, callback) {
  const ref = shopDoc(shopId, 'daily_summaries', dateStr);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback({ date: dateStr, total_sales_amount: 0, total_profit: 0, sales_count: 0 });
    }
  });
}

export function subscribeDailySummariesRange(shopId, startDate, endDate, callback) {
  const q = query(
    shopCollection(shopId, 'daily_summaries'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date')
  );
  return onSnapshot(q, (snapshot) => {
    const summaries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(summaries);
  });
}

// ==================== SHOP STAFF MANAGEMENT ====================

export async function getShopStaff(shopId) {
  const q = query(
    collection(firestore, 'users'),
    where('shopId', '==', shopId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function updateStaffRole(uid, role) {
  await updateDoc(doc(firestore, 'users', uid), {
    role,
    updatedAt: serverTimestamp()
  });
}

export async function removeStaffAccess(uid) {
  await updateDoc(doc(firestore, 'users', uid), {
    role: 'disabled',
    updatedAt: serverTimestamp()
  });
}
