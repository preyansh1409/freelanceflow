import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InvoiceCard from '../../components/InvoiceCard/InvoiceCard';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FiPlus, FiFileText, FiDollarSign, FiCalendar, FiClock, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  // Metrics state
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [paidRevenue, setPaidRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [overdueRevenue, setOverdueRevenue] = useState(0);

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [invoiceToDeleteId, setInvoiceToDeleteId] = useState(null);

  // 3-Step Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardClientId, setWizardClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2 variables
  const [unbilledLogs, setUnbilledLogs] = useState([]);
  const [selectedLogIds, setSelectedLogIds] = useState([]);

  // Step 3 variables
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const fetchInvoicesData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/clients')
      ]);

      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);

      if (clientsRes.data.length > 0 && !wizardClientId) {
        setWizardClientId(clientsRes.data[0].id);
      }

      // Compute statistics strip metrics
      const list = invoicesRes.data;
      const invoiced = list.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const paid = list.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const pending = list.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const overdue = list.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

      setTotalInvoiced(invoiced);
      setPaidRevenue(paid);
      setPendingRevenue(pending);
      setOverdueRevenue(overdue);
    } catch (err) {
      toast.error('Could not load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  const openWizardModal = () => {
    if (clients.length === 0) {
      toast.error('Add a client before generating invoices.');
      return;
    }
    setWizardStep(1);
    setWizardClientId(clients[0].id);
    setStartDate('');
    setEndDate('');
    setUnbilledLogs([]);
    setSelectedLogIds([]);
    setInvoiceDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)); // Default due 30 days out
    setTaxRate(18);
    setInvoiceNotes('');
    setIsWizardOpen(true);
  };

  const handleStep1Next = async () => {
    if (!wizardClientId) {
      toast.error('Please select a client');
      return;
    }

    setLoading(true);
    try {
      // Fetch unbilled logs for selected client
      const { data } = await api.get(`/timelogs?is_billed=0`);
      // Filter logs locally by client_id and dates (if selected)
      let filtered = data.filter(log => {
        // Find if project belongs to selected client
        // API logs return client_name/project_name/duration_minutes
        // We will fetch logs scoped by projectId or verify client match
        // Let's filter logs by project's client_id. Since backend timelogs list returns log.client_name but we also have project_id,
        // we can fetch the projects to verify. Or let's make a query or API filter.
        // Wait, the API `/api/timelogs` returns a list. Let's filter by logs where the project belongs to the selected client.
        // We can get projects of selected client first.
        return true;
      });

      // To make it fully robust, we get projects of selected client
      const projectsRes = await api.get(`/projects?client_id=${wizardClientId}`);
      const projectIds = projectsRes.data.map(p => p.id);
      
      filtered = data.filter(log => projectIds.includes(log.project_id));

      if (startDate) {
        filtered = filtered.filter(log => new Date(log.start_time) >= new Date(startDate + 'T00:00:00'));
      }
      if (endDate) {
        filtered = filtered.filter(log => new Date(log.start_time) <= new Date(endDate + 'T23:59:59'));
      }

      if (filtered.length === 0) {
        toast.error('No unbilled logs found for this client and date range.');
        return;
      }

      setUnbilledLogs(filtered);
      setSelectedLogIds(filtered.map(l => l.id)); // Default check all
      setWizardStep(2);
    } catch (err) {
      toast.error('Failed to load unbilled timesheets');
    } finally {
      setLoading(false);
    }
  };

  const toggleLogSelection = (logId) => {
    if (selectedLogIds.includes(logId)) {
      setSelectedLogIds(selectedLogIds.filter(id => id !== logId));
    } else {
      setSelectedLogIds([...selectedLogIds, logId]);
    }
  };

  const getWizardSubtotal = () => {
    const selectedLogs = unbilledLogs.filter(l => selectedLogIds.includes(l.id));
    return selectedLogs.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (selectedLogIds.length === 0) {
      toast.error('Select at least one timesheet log to bill');
      return;
    }
    if (!invoiceDueDate) {
      toast.error('Please select a due date');
      return;
    }

    setLoading(true);
    try {
      await api.post('/invoices', {
        client_id: wizardClientId,
        time_log_ids: selectedLogIds,
        due_date: invoiceDueDate,
        tax_rate: parseFloat(taxRate || 0),
        notes: invoiceNotes
      });

      toast.success('Invoice generated successfully!');
      setIsWizardOpen(false);
      await fetchInvoicesData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invId) => {
    try {
      await api.patch(`/invoices/${invId}/status`, { status: 'paid' });
      toast.success('Invoice marked as paid');
      fetchInvoicesData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openDeleteModal = (invId) => {
    setInvoiceToDeleteId(invId);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDeleteId) return;
    try {
      await api.delete(`/invoices/${invoiceToDeleteId}`);
      toast.success('Invoice deleted. Associated timesheets un-billed.');
      setIsDeleteOpen(false);
      fetchInvoicesData();
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  if (loading && invoices.length === 0) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  const selectedClientCurrency = clients.find(c => String(c.id) === String(wizardClientId))?.currency || 'INR';
  const subtotal = getWizardSubtotal();
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">Invoices</h2>
          <p className="text-sm text-neutral-text-secondary">Generate and manage billing invoices from unbilled hours.</p>
        </div>
        <button 
          onClick={openWizardModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-neutral-border rounded-xl shadow-sm">
        <div className="text-center p-2 border-r border-slate-100 last:border-0">
          <span className="text-[10px] text-neutral-text-secondary uppercase font-bold tracking-wider block">Total Invoiced</span>
          <span className="text-base font-extrabold text-neutral-text-primary font-mono mt-1 block">{formatCurrency(totalInvoiced)}</span>
        </div>
        <div className="text-center p-2 border-r border-slate-100 last:border-0">
          <span className="text-[10px] text-neutral-text-secondary uppercase font-bold tracking-wider block">Total Paid</span>
          <span className="text-base font-extrabold text-success font-mono mt-1 block">{formatCurrency(paidRevenue)}</span>
        </div>
        <div className="text-center p-2 border-r border-slate-100 last:border-0">
          <span className="text-[10px] text-neutral-text-secondary uppercase font-bold tracking-wider block">Pending</span>
          <span className="text-base font-extrabold text-warning font-mono mt-1 block">{formatCurrency(pendingRevenue)}</span>
        </div>
        <div className="text-center p-2 last:border-0">
          <span className="text-[10px] text-neutral-text-secondary uppercase font-bold tracking-wider block">Overdue</span>
          <span className="text-base font-extrabold text-danger font-mono mt-1 block">{formatCurrency(overdueRevenue)}</span>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden p-6">
        <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider mb-4">Invoice History</h3>

        {invoices.length === 0 ? (
          <EmptyState 
            title="No invoices generated yet"
            message="Convert your unbilled timesheets into downloadable PDF invoices by clicking Create Invoice."
            icon={FiFileText}
          />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-[10px] uppercase font-bold text-neutral-text-secondary tracking-wider text-left">
                <tr>
                  <th className="border border-slate-300 px-6 py-3">Invoice #</th>
                  <th className="border border-slate-300 px-6 py-3">Client</th>
                  <th className="border border-slate-300 px-6 py-3">Issue Date</th>
                  <th className="border border-slate-300 px-6 py-3">Due Date</th>
                  <th className="border border-slate-300 px-6 py-3">Total Amount</th>
                  <th className="border border-slate-300 px-6 py-3">Status</th>
                  <th className="border border-slate-300 px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoices.map(invoice => (
                  <InvoiceCard 
                    key={invoice.id} 
                    invoice={invoice} 
                    onMarkPaid={handleMarkPaid} 
                    onDelete={openDeleteModal} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3-Step Create Invoice Wizard Modal */}
      <Modal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        title={`Create Invoice — Step ${wizardStep} of 3`}
      >
        {/* STEP 1: SELECT CLIENT & DATE RANGE */}
        {wizardStep === 1 && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Select Client Profile*</label>
              <select 
                value={wizardClientId}
                onChange={(e) => setWizardClientId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Start Date (Optional)</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">End Date (Optional)</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsWizardOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleStep1Next}
                className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition font-bold"
              >
                <span>Find Timesheets</span>
                <FiArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW TIME LOGS */}
        {wizardStep === 2 && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-neutral-text-primary uppercase tracking-wider text-[10px]">Select Billable Logs</h4>
            <div className="max-h-[220px] overflow-y-auto border border-neutral-border rounded-lg divide-y divide-neutral-border bg-slate-50">
              {unbilledLogs.map(log => (
                <label key={log.id} className="flex items-start gap-3 p-3 hover:bg-slate-100 transition cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={selectedLogIds.includes(log.id)}
                    onChange={() => toggleLogSelection(log.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-neutral-text-primary block text-xs truncate">{log.project_name}</span>
                    <span className="text-[10px] text-neutral-text-secondary block truncate">{log.description || 'No description'}</span>
                    <span className="text-[10px] text-neutral-text-muted mt-0.5 block">{formatDate(log.start_time)} • {formatDuration(log.duration_minutes)}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-text-primary">{formatCurrency(log.amount, log.currency)}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center bg-slate-150 p-3 bg-slate-100 border border-neutral-border rounded-lg font-bold">
              <span className="text-neutral-text-secondary">Subtotal ({selectedLogIds.length} logs)</span>
              <span className="text-neutral-text-primary font-mono text-sm">{formatCurrency(subtotal, selectedClientCurrency)}</span>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setWizardStep(1)}
                className="flex items-center gap-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary"
              >
                <FiArrowLeft size={12} />
                <span>Back</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (selectedLogIds.length === 0) {
                    toast.error('Select at least one log');
                    return;
                  }
                  setWizardStep(3);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition font-bold"
              >
                <span>Continue</span>
                <FiArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS & PREVIEW */}
        {wizardStep === 3 && (
          <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Due Date*</label>
                <input 
                  type="date" 
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">GST / Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Invoice Notes / Payment Details</label>
              <textarea 
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="e.g. Bank: HDFC, A/C: XXXXXX, IFSC: HDFC0000..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            {/* Calculations Preview Summary */}
            <div className="p-4 bg-slate-50 border border-neutral-border rounded-xl space-y-2 text-xs">
              <div className="font-bold text-neutral-text-primary border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px]">Amount Summary</div>
              <div className="flex justify-between text-neutral-text-secondary font-medium">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal, selectedClientCurrency)}</span>
              </div>
              <div className="flex justify-between text-neutral-text-secondary font-medium">
                <span>GST ({taxRate}%)</span>
                <span className="font-mono">{formatCurrency(taxAmount, selectedClientCurrency)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-text-primary border-t border-slate-200 pt-2 text-sm">
                <span>TOTAL DUE</span>
                <span className="font-mono text-primary">{formatCurrency(totalAmount, selectedClientCurrency)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setWizardStep(2)}
                className="flex items-center gap-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary"
              >
                <FiArrowLeft size={12} />
                <span>Back</span>
              </button>
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg shadow-md transition font-bold"
              >
                <FiCheck size={14} />
                <span>Generate Invoice</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Delete Invoice?"
        message="Are you sure you want to delete this invoice? The associated timesheets will be marked back as UNBILLED."
        confirmText="Delete Invoice"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default Invoices;
