import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiDollarSign, FiEdit, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

const ClientCard = ({ client, onEdit, onDelete }) => {
  const initials = client.name 
    ? client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'C';
  
  const avatarColors = ['bg-indigo-600', 'bg-violet-600', 'bg-cyan-600', 'bg-emerald-600', 'bg-amber-600', 'bg-red-600'];
  const avatarColor = avatarColors[client.id % avatarColors.length];

  return (
    <div className="bg-white border border-neutral-border rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-base shadow-inner`}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <Link to={`/clients/${client.id}`} className="font-bold text-neutral-text-primary hover:text-primary transition truncate block text-base">
              {client.name}
            </Link>
            {client.company && (
              <span className="text-xs text-neutral-text-secondary font-medium block truncate">{client.company}</span>
            )}
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-neutral-text-secondary border-t border-slate-100 pt-4 mb-4">
          {client.email && (
            <div className="flex items-center gap-2">
              <FiMail className="text-neutral-text-muted flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2">
              <FiPhone className="text-neutral-text-muted flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-neutral-text-muted flex-shrink-0" />
            {client.hourly_rate > 0 ? (
              <span>
                {client.rate_type === 'total' ? 'Total Cost' : 'Hourly'}:{' '}
                <span className="font-semibold text-neutral-text-primary">
                  {formatCurrency(client.hourly_rate, client.currency)}
                  {client.rate_type !== 'total' && <span className="text-neutral-text-muted font-normal">/hr</span>}
                </span>
              </span>
            ) : (
              <span className="text-neutral-text-muted italic">No rate set</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
        <Link 
          to={`/clients/${client.id}`} 
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition"
        >
          <FiBriefcase />
          <span>{client.active_projects || 0} active ({client.project_count || 0} total)</span>
        </Link>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => onEdit(client)} 
            className="p-1.5 rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-slate-50 transition border border-transparent hover:border-neutral-border"
            title="Edit Client"
          >
            <FiEdit size={14} />
          </button>
          <button 
            type="button"
            onClick={() => onDelete(client)} 
            className="p-1.5 rounded-lg text-danger hover:text-red-700 hover:bg-danger-light/30 transition border border-transparent hover:border-danger-light"
            title="Delete Client"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
