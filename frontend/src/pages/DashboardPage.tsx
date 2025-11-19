import React, { useMemo } from 'react';
import SummaryCard from '../components/SummaryCard';
import SalesChart from '../components/SalesChart';
import RecentSalesTable from '../components/RecentSalesTable';
import storeStocks from '../../../dataset/storeStocks.json';
import salesData from '../../../dataset/storeSales.json';

const DashboardPage: React.FC = () => {
  const stats = useMemo(() => {
    const totalSales = (salesData as any[]).reduce((acc, entry) => acc + ((entry.items || []).reduce((s: number, it: any) => s + (it.salesQty || 0), 0)), 0);
    const uniqueItems = new Set<string>();
    (storeStocks as any[]).forEach(s => uniqueItems.add(s.itemId));
    const lowStockCount = (storeStocks as any[]).filter(s => (s['availableQty'] ?? s['in-stock'] ?? 0) < (s['ideal-stock'] ?? Infinity)).length;
    return { totalSales, itemCount: uniqueItems.size, lowStockCount };
  }, []);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white tracking-wide">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Sales" value={stats.totalSales} subtitle="Total quantity sold (demo data)" />
        <SummaryCard title="Tracked Items" value={stats.itemCount} subtitle="Unique items in stock" />
        <SummaryCard title="Low Stock Items" value={stats.lowStockCount} subtitle="Items below ideal stock" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <RecentSalesTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
