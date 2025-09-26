import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE } from '../../lib/api'

export default function Products(){
  const [products, setProducts] = useState([])
  useEffect(()=>{
    axios.get(API_BASE + '/catalog/products')
      .then(res=>setProducts(res.data))
      .catch(()=>setProducts([{id:1, name:'Demo Product', price:10.0 }]))
  },[])
  return (
    <div>
      <h3>Products</h3>
      <pre>{JSON.stringify(products,null,2)}</pre>
    </div>
  )
}
