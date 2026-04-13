import { motion } from 'framer-motion';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="px-5 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-sm text-gray-400 text-center py-8">No transactions yet — the kiln is warming up!</p>
      </div>
    );
  }
  return (
    <div className="px-5 mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {transactions.map((txn, index) => (
          <motion.div key={txn.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{txn.product_name}</div>
              <div className="text-xs text-gray-500 mt-1">Qty: {txn.quantity} &bull; {formatTime(txn.created_at)}</div>
            </div>
            <div className="text-sm font-semibold text-gray-900">{formatCurrency(txn.total_amount)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
