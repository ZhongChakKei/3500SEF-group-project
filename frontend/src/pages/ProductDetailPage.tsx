import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { itemsApi, inventoryApi, storesApi, Item, Inventory, Store } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams();
  const { getAccessToken } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const [itemData, inventoryData, storesData] = await Promise.all([
          itemsApi.getById(productId),
          inventoryApi.getAll({ itemId: productId }),
          storesApi.getAll()
        ]);
        setItem(itemData);
        setInventory(inventoryData);
        setStores(storesData);
      } catch (e) {
        console.error('Failed to load product details:', e);
        setMessage('Failed to load product details');
      } finally { setLoading(false); }
    })();
  }, [productId]);

  const updateStock = async (storeId: string, newInStock: number) => {
    if (!productId) return;
    try {
      await inventoryApi.update(storeId, productId, { inStock: newInStock });
      setMessage(`Updated stock at store ${storeId}`);
      // Refresh inventory
      const updatedInv = await inventoryApi.getAll({ itemId: productId });
      setInventory(updatedInv);
    } catch (e: any) {
      setMessage('Failed to update stock: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-wide">Item Details</h2>
      </div>
      {message && <div className="p-3 bg-yellow-500/20 border border-yellow-400/50 text-xs text-yellow-200 rounded">{message}</div>}
      {loading && <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded bg-white/10 animate-pulse" />)}
      </div>}
      {!loading && item && <div className="space-y-5">
        <div className="bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 rounded-xl p-5 shadow shadow-black/40">
          <div className="mb-4">
            <div className="font-medium text-lg text-white tracking-wide">{item.itemName}</div>
            <div className="text-xs text-gray-300">ID: {item.itemId}</div>
            <div className="text-xs text-gray-300">Type: {item.itemType}</div>
            <div className="text-sm text-white mt-2">Price: ${item.unitPrice}</div>
          </div>
          
          <h3 className="text-sm font-medium text-white mb-3">Inventory by Store</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider">
                  <th className="py-1.5 pr-4 font-medium">Store</th>
                  <th className="py-1.5 pr-4 font-medium">In Stock</th>
                  <th className="py-1.5 pr-4 font-medium">Ideal Stock</th>
                  <th className="py-1.5 pr-4 font-medium">Reserved</th>
                  <th className="py-1.5 pr-4 font-medium">Available</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {stores.map(store => {
                  const inv = inventory.find(i => i.storeId === store.storeId);
                  return (
                    <tr key={store.storeId} className="border-t border-white/10">
                      <td className="py-1.5 pr-4 font-medium text-white">{store.storeCode}</td>
                      <td className="py-1.5 pr-4">{inv?.['in-stock'] ?? 0}</td>
                      <td className="py-1.5 pr-4">{inv?.['ideal-stock'] ?? 0}</td>
                      <td className="py-1.5 pr-4">{inv?.reservedQty ?? 0}</td>
                      <td className="py-1.5 pr-4">{inv?.availableQty ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>}
    </div>
  );
};
export default ProductDetailPage;
