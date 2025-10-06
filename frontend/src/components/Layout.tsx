import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/products', label: 'Products' },
  { path: '/inventory', label: 'Inventory' },
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
            <nav className="flex gap-4 text-sm">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'text-brand-600 font-medium' : 'text-gray-600 hover:text-brand-600'}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden sm:inline">{user?.email || user?.name}</span>
            <button onClick={logout} className="px-3 py-1.5 bg-brand-600 text-white rounded-md text-xs hover:bg-brand-700">Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-4">© {new Date().getFullYear()} Distributed Inventory Demo</footer>
    </div>
  );
};
export default Layout;
