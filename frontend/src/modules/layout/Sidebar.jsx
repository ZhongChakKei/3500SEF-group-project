import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const Icon = ({ children }) => (
  <span className="nav-icon" aria-hidden>{children}</span>
)

export default function Sidebar(){
  const { user, loginDemo, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <>
    <aside className={`sidebar ${collapsed ? 'collapsed':''}`}>
      {/* brand removed per request */}
      {!user ? (
        <button className="nav-link active" onClick={() => loginDemo('Alice', ['Admin','Cashier'])} title="Demo Login">
          <Icon>🔑</Icon> <span className="nav-label">Demo Login</span>
        </button>
      ) : (
        <div className="auth-box" style={{background:'rgba(255,255,255,0.12)', padding:'10px 12px', borderRadius:10, margin:'4px 0 8px'}}>
          <div style={{fontWeight:600}}><Icon>👋</Icon> <span className="nav-label">{user.name}</span></div>
          <div className="nav-label" style={{fontSize:12, opacity:.9}}>Roles: {user.roles.join(', ')}</div>
          <button className="nav-link" style={{marginTop:6}} onClick={logout}><Icon>🚪</Icon> <span className="nav-label">Logout</span></button>
        </div>
      )}
      <hr />
      <ul className="nav-list">
        <li>
          <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
            <Icon>🏠</Icon> <span className="nav-label">Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
            <Icon>📊</Icon> <span className="nav-label">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/sales/orders" className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
            <Icon>📅</Icon> <span className="nav-label">Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/catalog" className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
            <Icon>📦</Icon> <span className="nav-label">Products</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/customers" className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
            <Icon>👤</Icon> <span className="nav-label">Customers</span>
          </NavLink>
        </li>
      </ul>
      <div className="footer">
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active':''}`}>
          <Icon>⚙️</Icon> <span className="nav-label">Settings</span>
        </NavLink>
      </div>
    </aside>
    <button className="sidebar-toggle" onClick={() => setCollapsed(v=>!v)} title={collapsed? 'Expand sidebar':'Collapse sidebar'}>
      {collapsed ? '»' : '«'}
    </button>
    </>
  )
}
