import { formatCurrency } from '../../utils/currencyHelpers';
import { SkeletonStats } from '../common/Skeleton';

export function QuickStats({ todaySummary, lowStockCount, loading }) {
  if (loading) return <SkeletonStats />;

  const stats = [
    {
      label: 'Sales',
      value: formatCurrency(todaySummary?.total_sales_amount || 0),
      sublabel: 'Today',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      label: 'Profit',
      value: formatCurrency(todaySummary?.total_profit || 0),
      sublabel: 'Today',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600">
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="17,6 23,6 23,12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      label: 'Transactions',
      value: todaySummary?.sales_count || 0,
      sublabel: 'Today',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-600">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="8" y1="9" x2="16" y2="9" strokeLinecap="round" />
          <line x1="8" y1="13" x2="14" y2="13" strokeLinecap="round" />
        </svg>
      )
    },
    {
      label: 'Low Stock',
      value: lowStockCount || 0,
      sublabel: 'Items',
      color: lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400',
      bg: lowStockCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
      iconBg: lowStockCount > 0 ? 'bg-amber-100' : 'bg-gray-100',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400'}>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bg} rounded-2xl p-4 animate-fadeIn`} style={{ animationDelay: `${index * 50}ms` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              {stat.icon}
            </div>
            <span className="text-xs font-medium text-gray-500">{stat.sublabel}</span>
          </div>
          <div className={`text-xl font-bold ${stat.color} mb-0.5`}>
            {stat.value}
          </div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
