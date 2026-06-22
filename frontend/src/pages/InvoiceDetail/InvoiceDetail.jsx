import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { generateInvoicePDF } from '../../utils/generatePDF';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiArrowLeft, FiDownload, FiCheck, FiPrinter } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (err) {
      toast.error('Could not fetch invoice details');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!invoice || !user) return;
    try {
      generateInvoicePDF(invoice, user);
      toast.success('Invoice PDF generated and downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await api.patch(`/invoices/${id}/status`, { status: 'paid' });
      setInvoice({ ...invoice, status: 'paid' });
      toast.success('Invoice marked as paid');
    } catch (err) {
      toast.error('Failed to mark paid');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invoice) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/invoices" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-text-secondary hover:text-neutral-text-primary transition">
          <FiArrowLeft />
          <span>Back to Invoices list</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <FiDownload size={14} />
            <span>Download PDF</span>
          </button>

          {invoice.status !== 'paid' && (
            <button 
              onClick={handleMarkPaid}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-success hover:bg-green-600 disabled:bg-success/50 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
            >
              <FiCheck size={14} />
              <span>Mark as Paid</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Sheet container */}
      <div className="bg-white border border-neutral-border rounded-xl shadow-md overflow-hidden p-8 sm:p-12 space-y-8 text-slate-800">
        
        {/* Centered Freelancer Header */}
        <div className="text-center space-y-1 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{user?.name}</h2>
          <div className="text-sm text-slate-600">
            <p>{user?.email}</p>
            <p>{user?.phone || '+91 98765 43210'}</p>
          </div>
        </div>

        {/* Start from left: Date, Invoice number, Email address, Phone number in single line */}
        <div className="grid grid-cols-1 sm:grid-cols-4 border border-slate-300 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-slate-50 text-xs text-slate-800 rounded-lg overflow-hidden mt-2">
          <div className="p-3">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Date</span>
            <span className="text-slate-800 font-semibold">{formatDate(invoice.issue_date)}</span>
          </div>
          <div className="p-3">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Invoice Number</span>
            <span className="text-slate-800 font-mono font-semibold">{invoice.invoice_number}</span>
          </div>
          <div className="p-3">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Email Address</span>
            <span className="text-slate-800 font-semibold truncate block" title={invoice.client_email || ''}>
              {invoice.client_email || '—'}
            </span>
          </div>
          <div className="p-3">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Phone Number</span>
            <span className="text-slate-800 font-semibold">
              {invoice.client_phone || '—'}
            </span>
          </div>
        </div>

        {/* Bill To Section below the single line details */}
        <div className="text-left text-sm space-y-1 pt-4">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Bill To:</span>
          <h3 className="text-base font-extrabold text-slate-900">{invoice.client_name}</h3>
          {invoice.client_company && <p className="font-semibold text-slate-600">{invoice.client_company}</p>}
          {invoice.client_address && <p className="text-slate-600 whitespace-pre-wrap mt-1 max-w-xl">{invoice.client_address}</p>}
        </div>

        {/* Invoice items table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="border border-slate-300 px-4 py-3 text-left">Description</th>
                <th className="border border-slate-300 px-4 py-3 text-right">Rate</th>
                <th className="border border-slate-300 px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {invoice.items && invoice.items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/50">
                  <td className="border border-slate-300 px-4 py-3 font-normal text-slate-900">
                    {item.project_name || item.description}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-right font-mono font-normal">
                    {formatCurrency(item.rate, invoice.currency)}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-right font-mono font-normal">
                    {formatCurrency(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotals & Totals Row */}
        <div className="flex flex-col items-end gap-3 text-sm pt-4">
          <div className="w-full sm:w-[300px] space-y-2 border border-slate-300 p-4 rounded-xl bg-slate-50">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal</span>
              <span className="font-mono text-slate-800">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>GST ({invoice.tax_rate}%)</span>
              <span className="font-mono text-slate-800">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2 text-base">
              <span>Total Due</span>
              <span className="font-mono text-slate-900">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Invoice notes footer */}
        {invoice.notes && (
          <div className="border-t border-slate-100 pt-6 text-xs space-y-1.5">
            <span className="block text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Payment Details / Notes:</span>
            <p className="text-neutral-text-secondary leading-relaxed bg-slate-50 border border-neutral-border p-4 rounded-xl font-medium whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
