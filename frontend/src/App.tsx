import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InventoryPage from './pages/InventoryPage';
import CallbackPage from './pages/CallbackPage';
import Layout from './components/Layout';

// DEV MODE: Set to true to bypass authentication for testing
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_DEV_MODE === 'true';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // In dev mode, allow access without authentication
  if (DEV_MODE) {
    return <>{children}</>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { handleRedirectCallback, isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === '/callback') {
      handleRedirectCallback();
    }
  }, [location.pathname, handleRedirectCallback]);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
      <Route path="/products/:productId" element={<ProtectedRoute><Layout><ProductDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
