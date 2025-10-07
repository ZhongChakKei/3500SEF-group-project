import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import ProductDetailPage from './ProductDetailPage';
import { useDemoAuth } from '../state/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, login, logout } = useDemoAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Local Inventory Demo</h1>
        <nav style={{ display: 'flex', gap: 8 }}>
          <Link to="/products">Products</Link>
        </nav>
        <div style={{ marginLeft: 'auto' }}>
          {isAuthenticated ? <button onClick={logout}>Logout</button> : <button onClick={login}>Login</button>}
        </div>
      </header>
      <hr />
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useDemoAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
