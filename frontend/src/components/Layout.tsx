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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-brand-600">Inventory & Sales</span>
            <nav className="flex gap-2 text-sm">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-brand-100 text-brand-700 font-semibold shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-600'
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
            <span className="text-gray-700 font-medium hidden sm:inline">
              👤 {user?.['cognito:username'] || user?.preferred_username || user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <button onClick={logout} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs hover:bg-brand-700 transition-colors">Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-4">© {new Date().getFullYear()} Distributed Inventory Demo</footer>
    </div>
  );
};
export default Layout;
