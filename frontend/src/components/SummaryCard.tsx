import React from 'react';

const SummaryCard: React.FC<{ title: string; value: string | number; subtitle?: string }> = ({ title, value, subtitle }) => {
  return (
    <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-300">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
      {subtitle ? <div className="text-[11px] text-gray-400 mt-2">{subtitle}</div> : null}
    </div>
  );
};

export default SummaryCard;
