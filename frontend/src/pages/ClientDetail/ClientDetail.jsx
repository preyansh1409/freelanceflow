import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { FiArrowLeft, FiPlus, FiBriefcase, FiMail, FiPhone, FiMapPin, FiEdit, FiTrash2, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Client Form fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');

  // Project Form fields
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectBudget, setProjectBudget] = useState('0');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [projectColor, setProjectColor] = useState('#4F46E5');

  const presetColors = ['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626'];

  const fetchClientData = async () => {
    try {
      const [clientRes, projectsRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/projects?client_id=${id}`)
      ]);
      setClient(clientRes.data);
      setProjects(projectsRes.data);

      // Pre-fill client form
      setName(clientRes.data.name || '');
      setCompany(clientRes.data.company || '');
      setEmail(clientRes.data.email || '');
      setPhone(clientRes.data.phone || '');
      setAddress(clientRes.data.address || '');
      setHourlyRate(String(clientRes.data.hourly_rate) || '0');
      setCurrency(clientRes.data.currency || 'INR');
      setNotes(clientRes.data.notes || '');
    } catch (err) {
      toast.error('Could not fetch client details');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const handleEditClientSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const { data } = await api.put(`/clients/${id}`, {
        name, company, email, phone, address, hourly_rate: parseFloat(hourlyRate || 0), currency, notes
      });
      setClient(data);
      toast.success('Client updated successfully');
      setIsEditClientOpen(false);
    } catch (err) {
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClientConfirm = async () => {
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted successfully');
      setIsDeleteClientOpen(false);
      navigate('/clients');
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const handleAddProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectName) return;
    try {
      const { data } = await api.post('/projects', {
        client_id: id,
        name: projectName,
        description: projectDesc,
        budget: parseFloat(projectBudget || 0),
        start_date: projectStartDate || null,
        end_date: projectEndDate || null,
        color: projectColor
      });
      // enrich project details to match API listing structure
      const enrichedProject = {
        ...data,
        client_name: client.name,
        client_company: client.company,
        hourly_rate: client.hourly_rate,
        currency: client.currency,
        task_count: 0,
        done_tasks: 0,
        total_minutes: 0,
        total_billed_amount: 0,
        burn_rate_pct: 0
      };
      setProjects([enrichedProject, ...projects]);
      toast.success('Project created successfully');
      setIsAddProjectOpen(false);
      // Reset form
      setProjectName('');
      setProjectDesc('');
      setProjectBudget('0');
      setProjectStartDate('');
      setProjectEndDate('');
      setProjectColor('#4F46E5');
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const openDeleteProjectModal = (proj) => {
    setProjectToDelete(proj);
    setIsDeleteProjectOpen(true);
  };

  const handleDeleteProjectConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast.success('Project deleted');
      setIsDeleteProjectOpen(false);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (isEditClientOpen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditClientOpen(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-border text-neutral-text-secondary hover:text-neutral-text-primary transition shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight font-black">Edit Client Details</h2>
            <p className="text-sm text-neutral-text-secondary">Update information for client profile "{client?.name}".</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 max-w-3xl">
          <form onSubmit={handleEditClientSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Client Name*</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Company Name</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="block text-neutral-text-secondary">Hourly Rate*</label>
                    <input 
                      type="number" 
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                      required
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="block text-neutral-text-secondary">Currency</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-2 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Billing Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Internal Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsEditClientOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
              >
                Update Client
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddProjectOpen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddProjectOpen(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-border text-neutral-text-secondary hover:text-neutral-text-primary transition shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight font-black">Create New Project</h2>
            <p className="text-sm text-neutral-text-secondary">Create a new project for client "{client?.name}".</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 max-w-3xl">
          <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary font-semibold">Project Name*</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Mobile App Development"
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Description</label>
              <textarea 
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Project details and scope..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Start Date</label>
                <input 
                  type="date" 
                  value={projectStartDate}
                  onChange={(e) => setProjectStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">End Date</label>
                <input 
                  type="date" 
                  value={projectEndDate}
                  onChange={(e) => setProjectEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Total Project Budget ({client?.currency || 'INR'})</label>
                <input 
                  type="number" 
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary mb-1">Color Theme</label>
                <div className="flex items-center gap-1.5 py-1">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProjectColor(color)}
                      className="w-6 h-6 rounded-full border-2 transition transform hover:scale-110 flex-shrink-0"
                      style={{ 
                        backgroundColor: color,
                        borderColor: projectColor === color ? '#1E293B' : 'transparent' 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsAddProjectOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link & Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/clients" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-text-secondary hover:text-neutral-text-primary transition">
          <FiArrowLeft />
          <span>Back to Clients list</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditClientOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-border bg-white hover:bg-slate-50 text-neutral-text-secondary hover:text-neutral-text-primary text-xs font-bold rounded-lg transition"
          >
            <FiEdit size={14} />
            <span>Edit Profile</span>
          </button>
          <button 
            onClick={() => setIsDeleteClientOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-transparent bg-danger-light/10 text-danger hover:bg-danger/10 text-xs font-bold rounded-lg transition"
          >
            <FiTrash2 size={14} />
            <span>Delete Client</span>
          </button>
        </div>
      </div>

      {/* Main split details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Profile Details */}
        <div className="bg-white border border-neutral-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
          <div>
            <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg mb-4">
              {client.name ? client.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'C'}
            </div>
            <h3 className="text-lg font-black text-neutral-text-primary tracking-tight">{client.name}</h3>
            {client.company && (
              <span className="text-xs text-neutral-text-secondary font-medium">{client.company}</span>
            )}
          </div>

          <div className="space-y-4 text-xs text-neutral-text-secondary border-t border-slate-100 pt-6">
            {client.email && (
              <div className="flex items-start gap-2.5">
                <FiMail className="mt-0.5 text-neutral-text-muted flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-text-primary">Email</span>
                  <a href={`mailto:${client.email}`} className="hover:text-primary truncate block">{client.email}</a>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-start gap-2.5">
                <FiPhone className="mt-0.5 text-neutral-text-muted flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-text-primary">Phone</span>
                  <span>{client.phone}</span>
                </div>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2.5">
                <FiMapPin className="mt-0.5 text-neutral-text-muted flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-neutral-text-primary">Address</span>
                  <span className="whitespace-pre-wrap leading-relaxed">{client.address}</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <span className="w-4 h-4 text-neutral-text-muted font-bold block flex-shrink-0">₹</span>
              <div>
                <span className="block font-semibold text-neutral-text-primary">Hourly Billing Rate</span>
                <span className="font-bold text-neutral-text-primary">{formatCurrency(client.hourly_rate, client.currency)}/hr</span>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="border-t border-slate-100 pt-6 space-y-2 text-xs">
              <span className="block font-bold text-neutral-text-primary uppercase tracking-wider text-[10px]">Client Notes</span>
              <p className="text-neutral-text-secondary leading-relaxed bg-slate-50 border border-neutral-border rounded-lg p-3 italic">
                "{client.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Projects grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-text-primary uppercase tracking-wider">Projects for this Client</h3>
            <button 
              onClick={() => setIsAddProjectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <FiPlus size={14} />
              <span>Create Project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState 
              title="No projects logged yet"
              message={`You have not logged any projects for ${client.name} yet. Create one to get started.`}
              icon={FiBriefcase}
              actionButton={
                <button 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition"
                >
                  <FiPlus size={14} />
                  <span>Create Project</span>
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto bg-white border border-slate-300 rounded-lg shadow-sm">
              <table className="w-full border-collapse text-left text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider select-none border-b border-slate-300">
                    <th className="border border-slate-300 px-4 py-3 text-center">Project Title</th>
                    <th className="border border-slate-300 px-4 py-3 text-center">Start Date</th>
                    <th className="border border-slate-300 px-4 py-3 text-center">End Date</th>
                    <th className="border border-slate-300 px-4 py-3 text-center">Budget</th>
                    <th className="border border-slate-300 px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.map((project, i) => {
                    const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
                    return (
                    <tr key={project.id} style={{ background: rowBg }} className="hover:bg-slate-100/70 transition-colors">
                      <td className="border border-slate-300 px-4 py-3">
                        <div className="text-slate-800 font-normal">{project.name}</div>
                        {project.description && (
                          <div className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{project.description}</div>
                        )}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-800 font-normal">
                        {formatDate(project.start_date)}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-slate-800 font-normal">
                        {formatDate(project.end_date)}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-left font-mono text-slate-800 font-normal">
                        {formatCurrency(project.budget, project.currency)}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="inline-block px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 text-indigo-600 font-normal text-xs transition cursor-pointer shadow-sm"
                        >
                          View/Edit
                        </button>
                        <button
                          onClick={() => openDeleteProjectModal(project)}
                          className="inline-block px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-red-50 hover:border-red-300 text-red-650 font-normal text-xs transition cursor-pointer shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      {/* Delete Client Modal */}
      <ConfirmDialog 
        isOpen={isDeleteClientOpen} 
        title="Delete Client Profile?"
        message={`Are you sure you want to delete client "${client?.name}"? All associated projects, tasks, time logs, and invoices will be deleted. This action is irreversible.`}
        confirmText="Delete Client"
        cancelText="Cancel"
        onConfirm={handleDeleteClientConfirm}
        onCancel={() => setIsDeleteClientOpen(false)}
      />



      {/* Delete Project Modal */}
      <ConfirmDialog 
        isOpen={isDeleteProjectOpen} 
        title="Delete Project?"
        message={`Are you sure you want to delete project "${projectToDelete?.name}"? All associated tasks and time logs will be deleted permanently.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteProjectConfirm}
        onCancel={() => setIsDeleteProjectOpen(false)}
      />
    </div>
  );
};

export default ClientDetail;
