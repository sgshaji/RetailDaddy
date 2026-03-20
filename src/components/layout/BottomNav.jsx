import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: '📊',
      label: 'Dashboard'
    },
    {
      path: '/quick-sale',
      icon: '💰',
      label: 'Quick Sale'
    },
    {
      path: '/products',
      icon: '📦',
      label: 'Products'
    },
    {
      path: '/inventory',
      icon: '📋',
      label: 'Inventory'
    },
    {
      path: '/admin',
      icon: '👤',
      label: 'Account'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40">
      <div className="flex justify-around items-center h-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[60px] transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
