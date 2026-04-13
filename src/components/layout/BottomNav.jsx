import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/sales', id: 'sales', label: 'Sales', icon: TrendingUp },
  { path: '/inventory', id: 'inventory', label: 'Inventory', icon: Package },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 pt-2 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-5 relative no-select min-w-[72px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-amber-50 rounded-2xl"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <Icon
                    className={`w-[22px] h-[22px] relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-amber-700' : 'text-gray-400'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className={`text-[11px] font-semibold relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-amber-700' : 'text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
