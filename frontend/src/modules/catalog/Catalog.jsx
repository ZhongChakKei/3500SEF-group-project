import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE } from '../../lib/api'

export default function Catalog(){
  const [customers, setCustomers] = useState([])
  useEffect(()=>{
    axios.get(API_BASE + '/customers')
      .then(res=>setCustomers(res.data))
      .catch(()=>setCustomers([{id:'C001', name:'Acme'}]))
  },[])
  return (
    <div>
      <h3>Catalog Management</h3>
      <ul>
        <li>Customer List</li>
        <li>Loyalty / Membership</li>
        <li>Purchase History</li>
        <li>Notifications & Alerts</li>
      </ul>
      <h4>Sample Customers from API</h4>
      <pre>{JSON.stringify(customers,null,2)}</pre>
    </div>
  )
}
