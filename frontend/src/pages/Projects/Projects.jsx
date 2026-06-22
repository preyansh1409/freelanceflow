import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FiPlus, FiBriefcase, FiArrowLeft } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam || 'all');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('all');
    }
  }, [tabParam]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected project for edit or delete
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Form fields
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [billingType, setBillingType] = useState('hourly');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const presetColors = ['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626'];

  const fetchData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients')
      ]);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
      if (clientsRes.data.length > 0) {
        setClientId(clientsRes.data[0].id);
      }
    } catch (err) {
      toast.error('Could not load projects data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Parse duration string like "3 months", "2 weeks", "45 days" and compute end date from start
  const computeEndDate = (start, durationStr) => {
    if (!start || !durationStr) return '';
    const d = new Date(start);
    const lower = durationStr.trim().toLowerCase();
    const match = lower.match(/(\d+(\.\d+)?)\s*(month|week|day|year)s?/);
    if (!match) return '';
    const amount = parseFloat(match[1]);
    const unit = match[3];
    if (unit === 'month') d.setMonth(d.getMonth() + amount);
    else if (unit === 'week') d.setDate(d.getDate() + amount * 7);
    else if (unit === 'day') d.setDate(d.getDate() + amount);
    else if (unit === 'year') d.setFullYear(d.getFullYear() + amount);
    return d.toISOString().substring(0, 10);
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    const auto = computeEndDate(val, duration);
    if (auto) setEndDate(auto);
  };

  const handleDurationChange = (val) => {
    setDuration(val);
    if (startDate) {
      const auto = computeEndDate(startDate, val);
      if (auto) setEndDate(auto);
    }
  };

  const openAddModal = () => {
    if (clients.length === 0) {
      toast.error('You need to add at least one client before creating a project.');
      return;
    }
    setSelectedProject(null);
    setClientId(clients[0].id);
    setName('');
    setDescription('');
    setStatus('active');
    setBillingType('hourly');
    setDuration('');
    setBudget('0');
    setStartDate('');
    setEndDate('');
    setColor('#4F46E5');
    setIsFormOpen(true);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setClientId(project.client_id || '');
    setName(project.name || '');
    setDescription(project.description || '');
    setStatus(project.status || 'active');
    setBillingType(project.billing_type || 'hourly');
    setDuration(project.duration || '');
    setBudget(String(project.budget) || '0');
    setStartDate(project.start_date ? project.start_date.substring(0, 10) : '');
    setEndDate(project.end_date ? project.end_date.substring(0, 10) : '');
    setColor(project.color || '#4F46E5');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId || !name) {
      toast.error('Client and project name are required');
      return;
    }

    const payload = {
      client_id: clientId,
      name,
      description,
      status,
      billing_type: billingType,
      duration: duration || null,
      budget: parseFloat(budget || 0),
      start_date: startDate || null,
      end_date: endDate || null,
      color
    };

    try {
      if (selectedProject) {
        // Update project
        const { data } = await api.put(`/projects/${selectedProject.id}`, payload);
        const clientObj = clients.find(c => String(c.id) === String(clientId));
        // Enrich local listing
        const enriched = {
          ...selectedProject,
          ...data,
          client_name: clientObj ? clientObj.name : selectedProject.client_name,
          client_company: clientObj ? clientObj.company : selectedProject.client_company,
          hourly_rate: clientObj ? clientObj.hourly_rate : selectedProject.hourly_rate,
          currency: clientObj ? clientObj.currency : selectedProject.currency
        };
        // Update burn rate pct if budget changed
        enriched.burn_rate_pct = enriched.budget > 0
          ? Math.min(100, Math.round(((enriched.total_billed_amount || 0) / enriched.budget) * 100))
          : 0;

        setProjects(projects.map(p => p.id === selectedProject.id ? enriched : p));
        toast.success('Project updated');
      } else {
        // Create project
        const { data } = await api.post('/projects', payload);
        const clientObj = clients.find(c => String(c.id) === String(clientId));
        const enriched = {
          ...data,
          client_name: clientObj ? clientObj.name : 'Unknown',
          client_company: clientObj ? clientObj.company : '',
          hourly_rate: clientObj ? clientObj.hourly_rate : 0,
          currency: clientObj ? clientObj.currency : 'INR',
          task_count: 0,
          done_tasks: 0,
          total_minutes: 0,
          total_billed_amount: 0,
          burn_rate_pct: 0
        };
        setProjects([enriched, ...projects]);
        toast.success('Project created');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast.success('Project deleted successfully');
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  // Filter projects by activeTab status
  const filteredProjects = activeTab === 'all'
    ? projects
    : projects.filter(p => p.status === activeTab);

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
              {selectedProject ? 'Modify Project Settings' : 'Create New Project'}
            </h2>
            <p className="text-sm text-neutral-text-secondary">
              {selectedProject ? `Update details and configurations for project "${name}".` : 'Enter details to launch a new client project.'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Client Profile*</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={Boolean(selectedProject)} // Avoid shifting clients on existing project
                  className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                  required
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Project Title*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Overhaul"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Scope details..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Billing Model*</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value)}
                  className="w-full px-2 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                  required
                >
                  <option value="hourly">Hourly Rate (Calculated from timesheets)</option>
                  <option value="fixed">Fixed Price (Flat-rate contract value)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Expected Project Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  placeholder="e.g. 3 Months, 45 Days, 2 Weeks"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">
                {billingType === 'fixed' ? 'Total Project Cost (Fixed)*' : 'Total Project Budget'}
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                placeholder={billingType === 'fixed' ? 'e.g. 50000' : 'e.g. 150000'}
              />
              {billingType === 'fixed' && (
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Note: Billed amount will be locked to this flat rate.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
              >
                {selectedProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All Projects' },
    { id: 'active', label: 'Active' },
    { id: 'on_hold', label: 'On Hold' },
    { id: 'completed', label: 'Completed' },
  ];

  const isCompletedView = tabParam === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">
            {isCompletedView ? 'Completed Projects' : 'Projects'}
          </h2>
          <p className="text-sm text-neutral-text-secondary">
            {isCompletedView 
              ? 'View details and summaries of all successfully completed contracts.'
              : 'Track budgets, deadlines, and task completions.'
            }
          </p>
        </div>
        {!isCompletedView && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isCompletedView && (
        <div className="flex border-b border-neutral-border gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`pb-3 text-xs font-bold transition uppercase tracking-wider relative ${activeTab === tab.id
                  ? 'text-primary'
                  : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Project Table */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          message={
            isCompletedView
              ? "You do not have any completed projects yet."
              : activeTab === 'all'
                ? "You haven't created any projects yet."
                : `There are no projects currently in status "${activeTab}".`
          }
          icon={FiBriefcase}
          actionButton={
            activeTab === 'all' && !isCompletedView ? (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition"
              >
                <FiPlus size={14} />
                <span>Create Your First Project</span>
              </button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-300 rounded-lg shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider select-none border-b border-slate-300">
                <th className="border border-slate-300 px-4 py-3 text-center">Client</th>
                <th className="border border-slate-300 px-4 py-3 text-center">Project Title</th>
                <th className="border border-slate-300 px-4 py-3 text-center">Start Date</th>
                <th className="border border-slate-300 px-4 py-3 text-center">End Date</th>
                <th className="border border-slate-300 px-4 py-3 text-center">Budget</th>
                <th className="border border-slate-300 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project, i) => {
                const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
                return (
                  <tr key={project.id} style={{ background: rowBg }} className="hover:bg-slate-100/70 transition-colors">
                    <td className="border border-slate-300 px-4 py-3">
                      <div className="text-slate-800 font-normal">{project.client_name}</div>
                      {project.client_company && (
                        <div className="text-slate-400 text-xs">{project.client_company}</div>
                      )}
                    </td>
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
                        onClick={() => openEditModal(project)}
                        className="inline-block px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 text-indigo-600 font-normal text-xs transition cursor-pointer shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="inline-block px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-red-50 hover:border-red-300 text-red-600 font-normal text-xs transition cursor-pointer shadow-sm"
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


      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Project?"
        message={`Are you sure you want to delete project "${projectToDelete?.name}"? All associated tasks and time logs will be deleted permanently.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default Projects;
