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
    <div className="space-y-7">
      <h2 className="text-xl font-semibold text-white tracking-wide">Inventory</h2>
      <div className="flex gap-2 border-b border-white/20">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={t === activeTab ? 'px-4 py-2 text-sm border-b-2 border-[#0066CC] font-medium text-white' : 'px-4 py-2 text-sm text-gray-400 hover:text-white'}>{t}</button>
        ))}
      </div>
      {loading && <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />)}
      </div>}
      {!loading && <div className="overflow-x-auto bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 rounded-lg shadow shadow-black/40">
        <table className="min-w-full text-sm">
          <thead className="bg-[rgba(20,40,70,0.5)] text-gray-400 text-xs uppercase border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Variant</th>
              <th className="text-left px-4 py-3 font-medium">On Hand</th>
              <th className="text-left px-4 py-3 font-medium">Reserved</th>
              <th className="text-left px-4 py-3 font-medium">Available</th>
              <th className="text-left px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={`${i.variantId}-${i.locationId}`} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-xs text-white">{i.variantId}</td>
                <td className="px-4 py-3 text-gray-300">{i.onHand}</td>
                <td className="px-4 py-3 text-gray-300">{i.reserved}</td>
                <td className="px-4 py-3 text-gray-300">{i.available}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(i.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
};
export default InventoryPage;
