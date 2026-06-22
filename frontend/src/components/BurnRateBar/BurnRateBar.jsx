import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const BurnRateBar = ({ percentage = 0, budget = 0, spent = 0, currency = 'INR' }) => {
  const colorClass = percentage < 70 ? 'text-success'
              : percentage < 90 ? 'text-warning font-semibold'
              : 'text-danger font-bold';

  const barColorClass = percentage < 70 ? 'bg-success'
              : percentage < 90 ? 'bg-warning'
              : 'bg-danger';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-text-secondary font-medium">Budget: {formatCurrency(budget, currency)}</span>
        <span className={`${colorClass}`}>{percentage}% used</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`} 
          style={{ width: `${Math.min(100, percentage)}%` }} 
        />
      </div>
      <div className="text-right text-[11px] text-neutral-text-muted">
        Spent: {formatCurrency(spent, currency)}
      </div>
    </div>
  );
};

export default BurnRateBar;
