import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { listProducts } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProductsPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const data = await listProducts(token);
        setItems(data);
      } finally { setLoading(false); }
    })();
  }, [getAccessToken]);

  const filtered = items.filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.product_id.includes(query));

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold text-white tracking-wide">Products</h2>
        <div className="flex items-center gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="bg-[rgba(30,50,80,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none" />
          <Link to="/products/new" className="bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white px-4 py-2 rounded text-sm shadow shadow-brand-900/30 transition-colors">
            + Add Product
          </Link>
        </div>
      </div>
      {loading && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 bg-white/10 animate-pulse rounded" />)}
      </div>}
      {!loading && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(p => (
          <Link key={p.product_id} to={`/products/${p.product_id}`} className="bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 rounded-lg p-3 shadow shadow-black/40 hover:border-[#0066CC]/60 hover:shadow-[#0066CC]/20 flex flex-col transition-colors">
            <div className="aspect-square bg-white/10 rounded mb-2 flex items-center justify-center text-xs text-gray-400">IMG</div>
            <div className="text-[10px] text-gray-400 mb-1 font-mono tracking-wide">{p.product_id}</div>
            <div className="font-medium text-sm text-white line-clamp-2 leading-snug">{p.title}</div>
            <div className="mt-auto text-[10px] text-gray-400 uppercase tracking-wider">{p.brand}</div>
          </Link>
        ))}
      </div>}
    </div>
  );
};
export default ProductsPage;
