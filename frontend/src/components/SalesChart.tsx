import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import salesData from '../../../dataset/storeSales.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const SalesChart: React.FC = () => {
  const { labels, values } = useMemo(() => {
    // aggregate sales by date
    const map = new Map<string, number>();
    (salesData as any[]).forEach(entry => {
      const date = entry.salesDate;
      const sum = (entry.items || []).reduce((s: number, it: any) => s + (it.salesQty || 0), 0);
      map.set(date, (map.get(date) || 0) + sum);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      labels: sorted.map(s => s[0]),
      values: sorted.map(s => s[1]),
    };
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Sales Qty',
        data: values,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderColor: 'rgba(59,130,246,0.95)',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' } },
      y: { ticks: { color: '#cbd5e1' } },
    },
  };

  return (
    <div className="p-5 rounded-xl bg-[rgba(30,50,80,0.55)] backdrop-blur border border-white/10 shadow shadow-black/40">
      <h3 className="font-medium mb-3 text-white">Sales (by date)</h3>
      {labels.length ? <Line data={data} options={options} /> : <p className="text-sm text-gray-300">No sales data available.</p>}
    </div>
  );
};

export default SalesChart;
