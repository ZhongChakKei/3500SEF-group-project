import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home.jsx'
import Auth from './auth/Auth.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import SalesPOS from './sales/SalesPOS.jsx'
import Catalog from './catalog/Catalog.jsx'
import Customers from './customers/Customers.jsx'
import Settings from './settings/Settings.jsx'
import Sidebar from './layout/Sidebar.jsx'
import '../styles.css'
import OrdersPage from './orders/Orders.jsx'
import Products from './products/Products.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales/*" element={<SalesPOS />} />
          <Route path="/catalog/*" element={<Catalog />} />
          <Route path="/sales/orders" element={<OrdersPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers/*" element={<Customers />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
