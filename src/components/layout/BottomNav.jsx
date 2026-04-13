import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales', id: 'sales', label: 'Sales', icon: TrendingUp },
  { path: '/inventory', id: 'inventory', label: 'Inventory', icon: Package },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40">
      <div className="flex items-center justify-around px-2 pt-2 pb-6 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link key={tab.id} to={tab.path} className="flex flex-col items-center justify-center gap-1 py-2 px-6 relative no-select">
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-amber-50 rounded-xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-amber-700' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium relative z-10 transition-colors ${isActive ? 'text-amber-700' : 'text-gray-500'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
