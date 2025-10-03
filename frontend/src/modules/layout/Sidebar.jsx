import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const Icon = ({ children }) => (
  <span className="nav-icon" aria-hidden>{children}</span>
);

export default function Sidebar() {
  const { user, login, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const handleDemoLogin = async (email, password, name) => {
    const result = await login(email, password);
    if (result.success) {
      console.log(`Logged in as ${name}`);
      navigate('/dashboard');
    } else {
      alert(`Demo login failed: ${result.message}`);
    }
  };
  
  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* brand removed per request */}
        {!user ? (
          <div style={{ marginBottom: '10px' }}>
            <button 
              className="nav-link active" 
              onClick={() => handleDemoLogin('admin@example.com', 'admin123', 'Admin')} 
              title="Demo Admin Login"
              style={{ marginBottom: '5px', width: '100%' }}
            >
              <Icon>🔑</Icon> <span className="nav-label">Admin Login</span>
            </button>
            <button 
              className="nav-link" 
              onClick={() => handleDemoLogin('user@example.com', 'user123', 'User')} 
              title="Demo User Login"
              style={{ width: '100%' }}
            >
              <Icon>�</Icon> <span className="nav-label">User Login</span>
            </button>
            <NavLink to="/auth" className="nav-link" style={{ marginTop: '5px', display: 'block', textAlign: 'center' }}>
              <Icon>📝</Icon> <span className="nav-label">Login/Register</span>
            </NavLink>
          </div>
        ) : (
          <div className="auth-box" style={{
            background: 'rgba(255,255,255,0.12)', 
            padding: '10px 12px', 
            borderRadius: 10, 
            margin: '4px 0 8px'
          }}>
            <div style={{ fontWeight: 600 }}>
              <Icon>👋</Icon> <span className="nav-label">{user.name}</span>
            </div>
            <div className="nav-label" style={{ fontSize: 12, opacity: .9 }}>
              Role: {user.role === 'admin' ? 'Administrator' : 'User'}
            </div>
            <div className="nav-label" style={{ fontSize: 11, opacity: .7 }}>
              {user.email}
            </div>
            <button 
              className="nav-link" 
              style={{ marginTop: 6 }} 
              onClick={logout}
            >
              <Icon>🚪</Icon> <span className="nav-label">Logout</span>
            </button>
          </div>
        )}
        <hr />
        <ul className="nav-list">
          <li>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>🏠</Icon> <span className="nav-label">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>📊</Icon> <span className="nav-label">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>📅</Icon> <span className="nav-label">Orders</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>📦</Icon> <span className="nav-label">Catalog</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>👤</Icon> <span className="nav-label">Customers</span>
            </NavLink>
          </li>
          
          {/* Admin-only menu items */}
          {isAdmin() && (
            <>
              <li>
                <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Icon>🛍️</Icon> <span className="nav-label">Products</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
        
        <div className="footer">
          {/* Settings is admin-only */}
          {isAdmin() && (
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon>⚙️</Icon> <span className="nav-label">Settings</span>
            </NavLink>
          )}
        </div>
      </aside>
      <button 
        className="sidebar-toggle" 
        onClick={() => setCollapsed(v => !v)} 
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '»' : '«'}
      </button>
    </>
  );
}
