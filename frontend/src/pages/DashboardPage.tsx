import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-medium mb-2">Low Stock (Top 5)</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="animate-pulse h-4 bg-gray-200 rounded w-3/4" />
            <li className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
            <li className="animate-pulse h-4 bg-gray-200 rounded w-2/3" />
            <li className="animate-pulse h-4 bg-gray-200 rounded w-1/3" />
            <li className="animate-pulse h-4 bg-gray-200 rounded w-1/4" />
          </ul>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-medium mb-2">Open Orders (Mock)</h3>
          <p className="text-xs text-gray-500">Implement once API available</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-medium mb-2">Transfers (Mock)</h3>
          <p className="text-xs text-gray-500">Implement future feature</p>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
