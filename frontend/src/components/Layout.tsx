import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/inventory', label: 'Inventory', icon: '📋' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-[color:#07111b] text-surface-200">
      <header className="border-b border-surface-200/10 backdrop-blur bg-[rgba(10,18,28,0.85)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-white tracking-wide">Inventory & Sales</span>
            <nav className="flex gap-2 text-sm">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                      isActive 
                        ? 'bg-[#0066CC]/30 text-white shadow-sm ring-1 ring-[#0066CC]/50' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white font-medium hidden sm:inline">
              👤 {user?.['cognito:username'] || user?.preferred_username || user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <button onClick={logout} className="px-3 py-1.5 bg-[#0066CC] text-white rounded-md text-xs hover:bg-[#0052A3] transition-colors shadow shadow-black/50">Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-[11px] text-surface-400 py-4 border-t border-surface-200/10">© {new Date().getFullYear()} Distributed Inventory Demo</footer>
    </div>
  );
};
export default Layout;
