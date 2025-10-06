import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Variant } from '../types';
import { listVariants, getInventoryByVariant, reserveStock } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

interface VariantWithInventory extends Variant {
  inventory?: { locationId: string; available: number; onHand: number; reserved: number }[];
}

const locations = ['STO-CWB', 'STO-TST', 'WH-HK'];

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams();
  const { getAccessToken } = useAuth();
  const [variants, setVariants] = useState<VariantWithInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [reserveState, setReserveState] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const list = await listVariants(token, productId);
        const enriched: VariantWithInventory[] = [];
        for (const v of list) {
          const inv = await getInventoryByVariant(token, v.variant_id);
          enriched.push({ ...v, inventory: inv });
        }
        setVariants(enriched);
      } finally { setLoading(false); }
    })();
  }, [productId, getAccessToken]);

  const doReserve = async (variantId: string, locationId: string) => {
    const qtyStr = reserveState[variantId] || '1';
    const qty = parseInt(qtyStr, 10) || 1;
    const token = await getAccessToken();
    if (!token) return;
    try {
      const res = await reserveStock(token, { variantId, locationId, qty });
      if (res.ok) {
        setMessage(`Reserved ${qty} at ${locationId}`);
        // Refresh that variant's inventory
        const updatedInv = await getInventoryByVariant(token, variantId);
        setVariants(vs => vs.map(v => v.variant_id === variantId ? { ...v, inventory: updatedInv } : v));
      } else {
        setMessage(res.error || 'Reservation failed');
      }
    } catch (e: any) {
      setMessage(e.message || 'Error reserving');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Product {productId}</h2>
      </div>
      {message && <div className="p-3 bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 rounded">{message}</div>}
      {loading && <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded bg-gray-200 animate-pulse" />)}
      </div>}
      {!loading && <div className="space-y-4">
        {variants.map(v => (
          <div key={v.variant_id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <div className="font-medium text-sm">{v.sku}</div>
                <div className="text-xs text-gray-500">{v.color} {v.storage_gb ? `${v.storage_gb}GB` : ''} {v.ram_gb ? `${v.ram_gb}GB RAM` : ''}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="number"
                  min={1}
                  value={reserveState[v.variant_id] || '1'}
                  onChange={e => setReserveState(s => ({ ...s, [v.variant_id]: e.target.value }))}
                  className="w-16 border rounded px-2 py-1"
                />
                {locations.map(loc => (
                  <button key={loc} onClick={() => doReserve(v.variant_id, loc)} className="px-2 py-1 bg-brand-600 text-white rounded text-xs hover:bg-brand-700">
                    Reserve @{loc}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1 pr-4">Location</th>
                    <th className="py-1 pr-4">OnHand</th>
                    <th className="py-1 pr-4">Reserved</th>
                    <th className="py-1 pr-4">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => {
                    const inv = v.inventory?.find(i => i.locationId === loc);
                    return (
                      <tr key={loc} className="border-t">
                        <td className="py-1 pr-4 font-medium">{loc}</td>
                        <td className="py-1 pr-4">{inv?.onHand ?? '-'}</td>
                        <td className="py-1 pr-4">{inv?.reserved ?? '-'}</td>
                        <td className="py-1 pr-4">{inv?.available ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
};
export default ProductDetailPage;
