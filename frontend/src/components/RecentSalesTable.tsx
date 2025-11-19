import React from 'react';
import salesData from '../../../dataset/storeSales.json';

const RecentSalesTable: React.FC = () => {
  // flatten items with date and storeId for display
  const rows = (salesData as any[]).flatMap(entry => {
    return (entry.items || []).map((it: any) => ({
      date: entry.salesDate,
      storeId: entry.storeId,
      itemId: it.itemId,
      qty: it.salesQty,
    }));
  });

  return (
    <div className="p-5 rounded-xl bg-[rgba(30,50,80,0.55)] border border-white/10 shadow-sm">
      <h3 className="font-medium text-white mb-3">Recent Sales</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-300">No recent sales</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 text-[12px]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Store</th>
                <th className="pb-2">Item</th>
                <th className="pb-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-t border-white/5">
                  <td className="py-2 text-gray-200">{r.date}</td>
                  <td className="py-2 text-gray-200">{r.storeId}</td>
                  <td className="py-2 text-gray-200">{r.itemId}</td>
                  <td className="py-2 text-white font-semibold">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentSalesTable;
