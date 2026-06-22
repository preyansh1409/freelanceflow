import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', description }) => {
  const colorStyles = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
    info: 'bg-info-light text-info',
  };

  return (
    <div className="flex flex-col p-6 bg-white border border-neutral-border rounded-xl shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-neutral-text-secondary">{title}</span>
        {Icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colorStyles[color] || colorStyles.primary}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold text-neutral-text-primary tracking-tight">{value}</span>
        {description && (
          <span className="text-xs text-neutral-text-muted mt-1">{description}</span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
