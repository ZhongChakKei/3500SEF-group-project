import React, { useEffect, useState, useMemo } from 'react';
import { getInventoryByLocation } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { InventoryItem } from '../types';

const tabs = ['STO-CWB', 'STO-TST', 'WH-HK'];

const InventoryPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('STO-CWB');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalOnHand = items.reduce((sum, item) => sum + (item.onHand || 0), 0);
    const totalReserved = items.reduce((sum, item) => sum + (item.reserved || 0), 0);
    const lowStock = items.filter(item => item.available < 10).length;
    return { totalItems, totalOnHand, totalReserved, lowStock };
  }, [items]);

  const filtered = items.filter(item => 
    !searchQuery || 
    item.variantId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatusColor = (available: number) => {
    if (available === 0) return 'text-red-400';
    if (available < 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-white tracking-wide">Inventory Management</h2>
        <input 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          placeholder="Search by variant ID..." 
          className="bg-[rgba(30,50,80,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-400 outline-none w-64"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Total Items</div>
          <div className="text-2xl font-semibold text-white">{stats.totalItems}</div>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Total On Hand</div>
          <div className="text-2xl font-semibold text-white">{stats.totalOnHand}</div>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Reserved</div>
          <div className="text-2xl font-semibold text-white">{stats.totalReserved}</div>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Low Stock Alerts</div>
          <div className="text-2xl font-semibold text-yellow-400">{stats.lowStock}</div>
        </div>
      </div>

      {/* Location Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
              t === activeTab 
                ? 'border-[#0066CC] text-white' 
                : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-[rgba(30,50,80,0.4)] rounded-xl border border-white/10">
          <div className="text-gray-400 text-sm">
            {searchQuery ? 'No items match your search' : 'No inventory items found for this location'}
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[rgba(30,50,80,0.55)] backdrop-blur border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[rgba(20,40,70,0.7)] border-b border-white/10">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Variant ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    On Hand
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(i => (
                  <tr 
                    key={`${i.variantId}-${i.locationId}`} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono text-sm text-white font-medium">{i.variantId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-200 font-medium">{i.onHand}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-200">{i.reserved}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`text-sm font-semibold ${getStockStatusColor(i.available)}`}>
                        {i.available}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        i.available === 0 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : i.available < 10 
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {i.available === 0 ? 'Out of Stock' : i.available < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-400">
                        {new Date(i.updatedAt).toLocaleDateString()} {new Date(i.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
