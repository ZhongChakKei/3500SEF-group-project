import React, { useEffect, useState } from 'react';
import { getInventoryByLocation } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { InventoryItem } from '../types';

const tabs = ['STO-CWB', 'STO-TST', 'WH-HK'];

const InventoryPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('STO-CWB');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const data = await getInventoryByLocation(token, activeTab);
        setItems(data);
      } finally { setLoading(false); }
    })();
  }, [activeTab, getAccessToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Inventory</h2>
      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={t === activeTab ? 'px-4 py-2 text-sm border-b-2 border-brand-600 font-medium' : 'px-4 py-2 text-sm text-gray-500 hover:text-brand-600'}>{t}</button>
        ))}
      </div>
      {loading && <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />)}
      </div>}
      {!loading && <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Variant</th>
              <th className="text-left px-4 py-2">On Hand</th>
              <th className="text-left px-4 py-2">Reserved</th>
              <th className="text-left px-4 py-2">Available</th>
              <th className="text-left px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={`${i.variantId}-${i.locationId}`} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs">{i.variantId}</td>
                <td className="px-4 py-2">{i.onHand}</td>
                <td className="px-4 py-2">{i.reserved}</td>
                <td className="px-4 py-2">{i.available}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{new Date(i.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
};
export default InventoryPage;
