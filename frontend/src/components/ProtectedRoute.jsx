import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext.jsx';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    // User is authenticated but not admin
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Access Denied</h3>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute requireAdmin={true}>{children}</ProtectedRoute>;
}