import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ClientCard from '../../components/ClientCard/ClientCard';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import { FiPlus, FiUsers, FiDollarSign, FiInfo, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Selected clients for edit or delete
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [rateType, setRateType] = useState('hourly'); // 'hourly' | 'total'

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data);
    } catch (err) {
      toast.error('Could not fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openAddModal = () => {
    // Check freemium limit for free plan
    const isFreePlan = user?.plan === 'free';
    if (isFreePlan && clients.length >= 2) {
      setIsUpgradeOpen(true);
      return;
    }

    setSelectedClient(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    setHourlyRate('');
    setCurrency('INR');
    setNotes('');
    setProjectDuration('');
    setRateType('hourly');
    setIsFormOpen(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setName(client.name || '');
    setCompany(client.company || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setHourlyRate(String(client.hourly_rate) || '0');
    setCurrency(client.currency || 'INR');
    setNotes(client.notes || '');
    setProjectDuration(client.project_duration || '');
    setRateType(client.rate_type || 'hourly');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Client name is required');
      return;
    }

    const payload = {
      name,
      company,
      email,
      phone,
      address,
      hourly_rate: parseFloat(hourlyRate || 0),
      rate_type: rateType,
      currency,
      notes,
      project_duration: projectDuration || null,
    };

    try {
      if (selectedClient) {
        // Update client
        const { data } = await api.put(`/clients/${selectedClient.id}`, payload);
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, ...data } : c));
        toast.success('Client updated successfully');
      } else {
        // Create client
        const { data: newClient } = await api.post('/clients', payload);
        setClients([newClient, ...clients]);
        toast.success('Client created successfully');

        // Auto-create project if Project Title was provided
        if (company && company.trim()) {
          try {
            const projectPayload = {
              client_id: newClient.id,
              name: company.trim(),
              description: '',
              status: 'active',
              billing_type: hourlyRate && parseFloat(hourlyRate) > 0 ? 'hourly' : 'fixed',
              duration: projectDuration || null,
              budget: parseFloat(hourlyRate || 0),
              start_date: null,
              end_date: null,
              color: '#4F46E5',
            };
            await api.post('/projects', projectPayload);
            toast.success(`Project "${company.trim()}" created and linked to client`);
          } catch (projErr) {
            toast.error('Client saved but failed to auto-create project');
          }
        }

        // Auto-create a pending invoice for the new client
        try {
          await api.post('/invoices/draft', { client_id: newClient.id });
          toast.success('Pending invoice created in Invoices');
        } catch (invErr) {
          // Non-blocking — don't fail the whole flow
        }
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save client');
    }
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await api.delete(`/clients/${clientToDelete.id}`);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      toast.success('Client deleted successfully');
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormOpen(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-border text-neutral-text-secondary hover:text-neutral-text-primary transition shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">
              {selectedClient ? 'Edit Client Details' : 'Add New Client'}
            </h2>
            <p className="text-sm text-neutral-text-secondary">
              {selectedClient ? `Update details for client profile.` : 'Enter details to register a new client profile.'}
            </p>
          </div>
        </div>

        {/* Large Main Page Form Container */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">

            {/* Row 1: Client Name | Phone Number | Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Client Name*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
            </div>

            {/* Row 2: Project/Company Title | Project Duration | Rate + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Project Title</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechCorp India"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Project Duration</label>
                <input
                  type="text"
                  value={projectDuration}
                  onChange={(e) => setProjectDuration(e.target.value)}
                  placeholder="e.g. 2 Months, 45 Days"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">
                  Rate &amp; Currency <span className="font-normal text-neutral-text-muted">(optional)</span>
                </label>
                {/* Single row: toggle | amount | currency */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setRateType('hourly')}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                        rateType === 'hourly'
                          ? 'bg-white text-neutral-text-primary shadow-sm border border-neutral-border/60'
                          : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                      }`}
                    >
                      Per Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setRateType('total')}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                        rateType === 'total'
                          ? 'bg-white text-neutral-text-primary shadow-sm border border-neutral-border/60'
                          : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                      }`}
                    >
                      Total
                    </button>
                  </div>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder={rateType === 'hourly' ? 'e.g. 500' : 'e.g. 50,000'}
                    className="flex-1 px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-24 px-2 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Billing Address — full width */}
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Billing Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full billing address..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            {/* Row 4: Specific Notes — full width */}
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Specific Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes about client preferences, special requirements..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="flex justify-center gap-4 pt-5 border-t border-neutral-border">
              <button
                type="submit"
                className="px-14 py-4 text-base font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md transition"
              >
                {selectedClient ? 'Update Client' : 'Add Client'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-14 py-4 text-base font-semibold border border-neutral-border rounded-xl text-neutral-text-secondary hover:text-neutral-text-primary hover:border-neutral-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">Clients CRM</h2>
          <p className="text-sm text-neutral-text-secondary">Manage billing rates and details for your clients.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Freemium Limit Badge (For Free Plan Users) */}
      {user?.plan === 'free' && (
        <div className="inline-flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
          <FiInfo size={14} className="flex-shrink-0" />
          <span>You are on the **Free Plan** ({clients.length}/2 clients active). Upgrade to Pro for unlimited clients.</span>
        </div>
      )}

      {/* Grid of Client Cards */}
      {clients.length === 0 ? (
        <EmptyState
          title="No clients added yet"
          message="Every project requires a client. Start by adding your first client."
          icon={FiUsers}
          actionButton={
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition"
            >
              <FiPlus size={14} />
              <span>Add Your First Client</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}


      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        title="Upgrade to Pro Plan"
      >
        <div className="text-center space-y-4 p-2 text-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-light text-primary rounded-full mx-auto">
            <FiDollarSign size={24} />
          </div>
          <h4 className="text-sm font-extrabold text-neutral-text-primary">Free Plan Limit Reached</h4>
          <p className="text-neutral-text-secondary leading-relaxed max-w-sm mx-auto font-medium">
            The free plan is capped at a maximum of **2 clients**. Upgrade to **FreelanceFlow Pro** to add unlimited clients, generate professional PDF invoices, and access advanced financial metrics.
          </p>
          <div className="bg-slate-50 border border-neutral-border rounded-lg p-4 text-left space-y-2">
            <div className="font-bold text-neutral-text-primary">Pro Plan Features:</div>
            <ul className="list-disc list-inside text-neutral-text-secondary space-y-1 font-medium">
              <li>Unlimited active clients & projects</li>
              <li>Priority tasks tracking & priority badges</li>
              <li>PDF invoices with custom tax rates & logos</li>
              <li>Time tracking stop-watch logs & timesheets</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-4 justify-center">
            <button
              type="button"
              onClick={() => setIsUpgradeOpen(false)}
              className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition font-bold"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUpgradeOpen(false);
                setIsPaymentOpen(true);
              }}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-md shadow-primary/20 transition font-bold"
            >
              Upgrade for ₹999/mo
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Client?"
        message={`Are you sure you want to delete client "${clientToDelete?.name}"? All associated projects, tasks, time logs, and invoices will be deleted. This action is irreversible.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Payment Modal */}
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
};

export default Clients;
