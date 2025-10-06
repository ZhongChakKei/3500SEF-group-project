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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Products</h2>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      {loading && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 bg-gray-200 animate-pulse rounded" />)}
      </div>}
      {!loading && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(p => (
          <Link key={p.product_id} to={`/products/${p.product_id}`} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow flex flex-col">
            <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-400">IMG</div>
            <div className="text-xs text-gray-500 mb-1">{p.product_id}</div>
            <div className="font-medium text-sm line-clamp-2">{p.title}</div>
            <div className="mt-auto text-[10px] text-gray-400">{p.brand}</div>
          </Link>
        ))}
      </div>}
    </div>
  );
};
export default ProductsPage;
