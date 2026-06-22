import React from 'react';
import { FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';
import { formatCurrency } from '../../utils/formatCurrency';

const TimeLogItem = ({ log, onDelete }) => {
  return (
    <tr className="hover:bg-slate-50 transition border-b border-neutral-border last:border-0">
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-text-primary font-medium">
        {formatDate(log.start_time)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs">
        <span className="font-semibold text-neutral-text-primary block truncate max-w-[150px]">{log.project_name}</span>
        {log.client_name && (
          <span className="text-[10px] text-neutral-text-secondary block truncate max-w-[150px]">Client: {log.client_name}</span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-neutral-text-secondary max-w-xs truncate">
        {log.description || <span className="italic text-neutral-text-muted">No description</span>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-text-primary font-mono font-bold">
        {formatDuration(log.duration_minutes)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-text-secondary font-mono">
        {formatCurrency(log.hourly_rate, log.currency)}/hr
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-text-primary font-mono font-bold">
        {formatCurrency(log.amount, log.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs">
        {log.is_billed ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light px-2 py-0.5 rounded-full border border-success/15">
            <FiCheckCircle size={10} />
            Billed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-info bg-info-light px-2 py-0.5 rounded-full border border-info/15">
            <FiClock size={10} />
            Unbilled
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
        {!log.is_billed && (
          <button 
            type="button"
            onClick={() => onDelete(log.id)}
            className="p-1.5 rounded-lg text-neutral-text-muted hover:text-danger hover:bg-danger-light/30 transition border border-transparent hover:border-danger-light"
            title="Delete Log"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
};

export default TimeLogItem;
