import React, { useEffect, useState } from 'react';
import { inventoryApi, itemsApi, storesApi, Inventory, Item, Store } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InventoryWithDetails extends Inventory {
  itemName?: string;
  storeName?: string;
}

const InventoryPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('');
  const [items, setItems] = useState<InventoryWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load stores on mount
    (async () => {
      try {
        const storeList = await storesApi.getAll();
        setStores(storeList);
        if (storeList.length > 0) {
          setActiveStoreId(storeList[0].storeId);
        }
      } catch (e) {
        console.error('Failed to load stores:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeStoreId) return;
    (async () => {
      setLoading(true);
      try {
        const inventory = await inventoryApi.getAll({ storeId: activeStoreId });
        const itemsData = await itemsApi.getAll();
        const itemsMap = new Map(itemsData.map(i => [i.itemId, i.itemName]));
        
        const enriched = inventory.map(inv => ({
          ...inv,
          itemName: itemsMap.get(inv.itemId) || inv.itemId
        }));
        setItems(enriched);
      } catch (e) {
        console.error('Failed to load inventory:', e);
      } finally { setLoading(false); }
    })();
  }, [activeStoreId]);

  return (
    <div className="space-y-7">
      <h2 className="text-xl font-semibold text-white tracking-wide">Inventory</h2>
      <div className="flex gap-2 border-b border-white/20">
        {stores.map(store => (
          <button 
            key={store.storeId} 
            onClick={() => setActiveStoreId(store.storeId)} 
            className={store.storeId === activeStoreId ? 'px-4 py-2 text-sm border-b-2 border-[#0066CC] font-medium text-white' : 'px-4 py-2 text-sm text-gray-400 hover:text-white'}
          >
            {store.storeCode}
          </button>
        ))}
      </div>
      {loading && <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />)}
      </div>}
      {!loading && <div className="overflow-x-auto bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 rounded-lg shadow shadow-black/40">
        <table className="min-w-full text-sm">
          <thead className="bg-[rgba(20,40,70,0.5)] text-gray-400 text-xs uppercase border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Item</th>
              <th className="text-left px-4 py-3 font-medium">In Stock</th>
              <th className="text-left px-4 py-3 font-medium">Ideal Stock</th>
              <th className="text-left px-4 py-3 font-medium">Reserved</th>
              <th className="text-left px-4 py-3 font-medium">Available</th>
              <th className="text-left px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={`${i.storeId}-${i.itemId}`} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{i.itemName}</td>
                <td className="px-4 py-3 text-gray-300">{i['in-stock']}</td>
                <td className="px-4 py-3 text-gray-300">{i['ideal-stock']}</td>
                <td className="px-4 py-3 text-gray-300">{i.reservedQty}</td>
                <td className="px-4 py-3 text-gray-300">{i.availableQty}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{i.updatedAt ? new Date(i.updatedAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
};
export default InventoryPage;
