import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../../lib/api'

function CreateOrder(){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

  useEffect(() => {
    axios.get(API_BASE + '/catalog/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([{id:1,name:'Demo Product',price:10.0}]))
  }, [])

  const addToCart = p => setCart([...cart, p])
  const total = cart.reduce((s,p)=>s+p.price,0)

  return (
    <div>
      <h4>Create Order</h4>
      <div style={{display:'flex', gap:24}}>
        <div>
          <h5>Products</h5>
          <ul>
            {products.map(p => (
              <li key={p.id}>
                {p.name} - ${p.price.toFixed(2)} <button onClick={()=>addToCart(p)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Cart</h5>
          <ul>
            {cart.map((p,i) => <li key={i}>{p.name} - ${p.price.toFixed(2)}</li>)}
          </ul>
          <p>Total: ${total.toFixed(2)}</p>
          <Link to="/sales/payment" state={{ total, items: cart }}>Proceed to Payment</Link>
        </div>
      </div>
    </div>
  )
}

function Payment(){
  return (
    <div>
      <h4>Payment</h4>
      <p>Cash / Card / e-Wallet (demo)</p>
    </div>
  )
}

function Orders(){
  const [orders, setOrders] = useState([])
  useEffect(()=>{
    axios.get(API_BASE + '/sales/orders')
      .then(res=>setOrders(res.data))
      .catch(()=>setOrders([{id:'ORD-1001', date:'2025-09-01', customer:'Walk-in'}]))
  },[])
  return (
    <div>
      <h4>Order History</h4>
      <pre>{JSON.stringify(orders,null,2)}</pre>
    </div>
  )
}

function Refund(){
  return <p>Refund / Return Processing (demo)</p>
}

export default function SalesPOS(){
  return (
    <div>
      <h3>Sales / POS</h3>
      <nav style={{display:'flex', gap:12}}>
        <Link to="/sales">Create Order</Link>
        <Link to="/sales/payment">Payment</Link>
        <Link to="/sales/orders">Order History</Link>
        <Link to="/sales/refund">Refund / Return</Link>
      </nav>
      <Routes>
        <Route index element={<CreateOrder />} />
        <Route path="payment" element={<Payment />} />
        <Route path="orders" element={<Orders />} />
        <Route path="refund" element={<Refund />} />
      </Routes>
    </div>
  )
}
