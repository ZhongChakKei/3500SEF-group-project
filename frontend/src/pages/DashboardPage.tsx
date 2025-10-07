import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-7">
      <h2 className="text-xl font-semibold text-white tracking-wide">Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 shadow shadow-black/40">
          <h3 className="font-medium mb-3 text-white">Low Stock (Top 5)</h3>
          <ul className="text-xs text-gray-300 space-y-2">
            {['w-3/4','w-1/2','w-2/3','w-1/3','w-1/4'].map(w => <li key={w} className={`animate-pulse h-3 rounded bg-white/20 ${w}`} />)}
          </ul>
        </div>
        <div className="p-5 rounded-xl bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 shadow shadow-black/40">
          <h3 className="font-medium mb-2 text-white">Open Orders (Mock)</h3>
          <p className="text-[11px] text-gray-300">Implement once API available</p>
        </div>
        <div className="p-5 rounded-xl bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 shadow shadow-black/40">
          <h3 className="font-medium mb-2 text-white">Transfers (Mock)</h3>
          <p className="text-[11px] text-gray-300">Implement future feature</p>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
