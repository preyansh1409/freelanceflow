import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheck, FiTrash2 } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const InvoiceCard = ({ invoice, onMarkPaid, onDelete }) => {
  const statusLabels = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };

  const statusColors = {
    draft: 'bg-info-light text-info border-info/20',
    sent: 'bg-warning-light text-warning border-warning/20',
    paid: 'bg-success-light text-success border-success/20',
    overdue: 'bg-danger-light text-danger border-danger/20',
    cancelled: 'bg-slate-100 text-neutral-text-secondary border-neutral-border',
  };

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        <Link to={`/invoices/${invoice.id}`} className="hover:text-primary transition">
          {invoice.invoice_number}
        </Link>
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        <span className="block truncate max-w-[150px]">{invoice.client_name}</span>
        {invoice.client_company && (
          <span className="block truncate max-w-[150px]">{invoice.client_company}</span>
        )}
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        {formatDate(invoice.issue_date)}
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        {formatDate(invoice.due_date)}
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        {formatCurrency(invoice.total, invoice.currency)}
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-text-primary">
        {statusLabels[invoice.status] || invoice.status}
      </td>
      <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-left text-xs space-x-1">
        <Link 
          to={`/invoices/${invoice.id}`}
          className="inline-flex p-1.5 rounded-lg text-neutral-text-secondary hover:text-primary hover:bg-slate-100 transition"
          title="View Invoice"
        >
          <FiEye size={14} />
        </Link>
        {invoice.status !== 'paid' && (
          <button 
            type="button"
            onClick={() => onMarkPaid(invoice.id)}
            className="inline-flex p-1.5 rounded-lg text-success hover:text-green-700 hover:bg-success-light/30 transition"
            title="Mark as Paid"
          >
            <FiCheck size={14} />
          </button>
        )}
        <button 
          type="button"
          onClick={() => onDelete(invoice.id)}
          className="inline-flex p-1.5 rounded-lg text-danger hover:text-red-700 hover:bg-danger-light/30 transition"
          title="Delete Invoice"
        >
          <FiTrash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

export default InvoiceCard;
