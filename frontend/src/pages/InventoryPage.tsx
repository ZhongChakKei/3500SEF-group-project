import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { storesApi } from '../services/api';
import axios from 'axios';
import { env } from '../utils/env';

interface Store {
  storeId: string;
  storeCode: string;
  location: {
    addressLine1: string;
    district: string;
    city: string;
  };
  status: string;
}

interface InventoryRecord {
  storeId: string;
  itemId: string;
  'in-stock': number;
  'ideal-stock': number;
  reservedQty: number;
  availableQty: number;
  updatedAt?: string;
}

const InventoryPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStore] = useState<string>('');
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const storeData = await storesApi.getAll();
        setStores(storeData);
        if (storeData.length > 0) {
          setActiveStore(storeData[0].storeId);
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeStore) return;
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${env.apiBaseUrl}/api/inventory`, {
          params: { storeId: activeStore }
        });
        setItems(response.data.data || []);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        setItems([]);
      } finally { setLoading(false); }
    })();
  }, [activeStore]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalOnHand = items.reduce((sum, item) => sum + (item['in-stock'] || 0), 0);
    const totalReserved = items.reduce((sum, item) => sum + (item.reservedQty || 0), 0);
    const lowStock = items.filter(item => item.availableQty < (item['ideal-stock'] * 0.5)).length;
    return { totalItems, totalOnHand, totalReserved, lowStock };
  }, [items]);

  const filtered = items.filter(item => 
    !searchQuery || 
    item.itemId?.toLowerCase().includes(searchQuery.toLowerCase())
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
          placeholder="Search by item ID..." 
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

      {/* Store Tabs */}
      {stores.length > 0 && (
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
          {stores.map(store => (
            <button 
              key={store.storeId} 
              onClick={() => setActiveStore(store.storeId)} 
              className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                store.storeId === activeStore 
                  ? 'border-[#0066CC] text-white' 
                  : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {store.storeCode} - {store.location.district}
            </button>
          ))}
        </div>
      )}

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
                    Item ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Ideal Stock
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(i => {
                  const stockPercentage = (i['in-stock'] / i['ideal-stock']) * 100;
                  const isLowStock = stockPercentage < 50;
                  const isOutOfStock = i.availableQty === 0;
                  
                  return (
                    <tr 
                      key={`${i.storeId}-${i.itemId}`} 
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-white font-medium">{i.itemId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-200 font-medium">{i['in-stock']}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-400">{i['ideal-stock']}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-200">{i.reservedQty}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`text-sm font-semibold ${getStockStatusColor(i.availableQty)}`}>
                          {i.availableQty}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOutOfStock
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : isLowStock
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
