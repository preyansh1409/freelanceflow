import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No data found', message = 'There are no items to display at the moment.', icon: Icon = FiInbox, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-neutral-border rounded-xl shadow-sm">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-4">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-neutral-text-primary mb-1">{title}</h3>
      <p className="text-sm text-neutral-text-secondary max-w-sm mb-6">{message}</p>
      {actionButton && <div className="mt-2">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
