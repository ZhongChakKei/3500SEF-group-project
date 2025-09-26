import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE } from '../../lib/api'

export default function OrdersPage(){
  const [orders, setOrders] = useState([])
  useEffect(()=>{
    axios.get(API_BASE + '/sales/orders')
      .then(res=>setOrders(res.data))
      .catch(()=>setOrders([{id:'ORD-1001', date:'2025-09-01', customer:'Walk-in', total: 23.75 }]))
  },[])
  return (
    <div>
      <h3>Orders</h3>
      <pre>{JSON.stringify(orders,null,2)}</pre>
    </div>
  )
}
