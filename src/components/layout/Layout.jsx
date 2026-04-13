import { BottomNav } from './BottomNav';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-amber-50/30">
      <div className="max-w-md mx-auto bg-amber-50/30 min-h-screen">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
