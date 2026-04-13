import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export function RecentTransactions({ transactions }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
        {transactions && transactions.length > 0 && (
          <span className="text-xs text-gray-400">{transactions.length} today</span>
        )}
      </div>

      {!transactions || transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Tap + to record a sale</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {transactions.map((txn, index) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-amber-700">{getInitials(txn.product_name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{txn.product_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {txn.quantity > 1 ? `${txn.quantity} units · ` : ''}{formatTime(txn.created_at)}
                </p>
              </div>
              <div className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                {formatCurrency(txn.total_amount)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
