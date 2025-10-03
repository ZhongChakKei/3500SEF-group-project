import React, { useState, useEffect } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import api, { API_BASE } from '../lib/api.js';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAdminEndpoint = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/admin-only');
      setAdminData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const testProtectedEndpoint = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/protected');
      setAdminData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch protected data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this panel.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>
      <p>Welcome, {user?.name}! You have admin privileges.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>API Testing</h3>
        {!API_BASE ? (
          <div style={{
            padding: '10px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            Backend API is not configured. Set VITE_API_BASE in your frontend .env to enable API tests.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={testAdminEndpoint}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Test Admin-Only Endpoint
            </button>
            
            <button
              onClick={testProtectedEndpoint}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Test Protected Endpoint
            </button>
          </div>
        )}
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}
        
        {adminData && (
          <div style={{
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px'
          }}>
            <h4>API Response:</h4>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(adminData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>User Information</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                Name:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {user?.name}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                Email:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {user?.email}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                Role:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {user?.role}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                User ID:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {user?.id}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}