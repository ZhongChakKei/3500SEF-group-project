import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import Auth from './auth/Auth.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import SalesPOS from './sales/SalesPOS.jsx';
import Catalog from './catalog/Catalog.jsx';
import Customers from './customers/Customers.jsx';
import Settings from './settings/Settings.jsx';
import Sidebar from './layout/Sidebar.jsx';
import OrdersPage from './orders/Orders.jsx';
import Products from './products/Products.jsx';
import { ProtectedRoute, AdminRoute } from '../components/ProtectedRoute.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import '../styles.css';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Show the main app with sidebar for all users (authenticated or not)
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<Auth />} />
          
          {/* Public routes - accessible to everyone */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog/*" element={<Catalog />} />
          <Route path="/sales/orders" element={<OrdersPage />} />
          <Route path="/customers/*" element={<Customers />} />
          
          {/* Protected route - requires authentication */}
          <Route 
            path="/sales/*" 
            element={
              <ProtectedRoute>
                <SalesPOS />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin-only routes */}
          <Route 
            path="/products" 
            element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            } 
          />
          <Route 
            path="/settings/*" 
            element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}
