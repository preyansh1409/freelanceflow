import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useTimer } from '../../context/TimerContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import TaskItem from '../../components/TaskItem/TaskItem';
import TimeLogItem from '../../components/TimeLogItem/TimeLogItem';
import BurnRateBar from '../../components/BurnRateBar/BurnRateBar';
import { FiArrowLeft, FiGrid, FiCheckSquare, FiClock, FiPlay, FiPlus, FiAlertCircle, FiSettings, FiTrash2, FiFileText } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDuration } from '../../utils/formatDuration';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRunning, start, stop, timerData } = useTimer();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [isDeleteLogOpen, setIsDeleteLogOpen] = useState(false);

  // Selected entities
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);
  const [logToDeleteId, setLogToDeleteId] = useState(null);

  // Project Settings fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [billingType, setBillingType] = useState('hourly');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#4F46E5');

  // Task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Quick timer form
  const [timerDesc, setTimerDesc] = useState('');

  const presetColors = ['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626'];

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, logsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/timelogs/project/${id}`)
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setLogs(logsRes.data);

      // Pre-fill edit fields
      setName(projectRes.data.name || '');
      setDescription(projectRes.data.description || '');
      setStatus(projectRes.data.status || 'active');
      setBillingType(projectRes.data.billing_type || 'hourly');
      setDuration(projectRes.data.duration || '');
      setBudget(String(projectRes.data.budget) || '0');
      setStartDate(projectRes.data.start_date ? projectRes.data.start_date.substring(0, 10) : '');
      setEndDate(projectRes.data.end_date ? projectRes.data.end_date.substring(0, 10) : '');
      setColor(projectRes.data.color || '#4F46E5');
    } catch (err) {
      toast.error('Could not fetch project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Project Settings Submission
  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const { data } = await api.put(`/projects/${id}`, {
        name, description, status, billing_type: billingType, duration: duration || null, budget: parseFloat(budget || 0), start_date: startDate || null, end_date: endDate || null, color
      });
      setProject({ ...project, ...data });
      toast.success('Project updated');
      setIsEditProjectOpen(false);
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setIsDeleteProjectOpen(false);
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  // Task creation
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      const { data } = await api.post('/tasks', {
        project_id: id,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        estimated_hours: parseFloat(taskEstimatedHours) || null,
        due_date: taskDueDate || null
      });
      setTasks([data, ...tasks]);
      toast.success('Task created successfully');
      setIsAddTaskOpen(false);
      // Reset task fields
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskEstimatedHours('');
      setTaskDueDate('');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      const { data } = await api.put(`/tasks/${taskId}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        status: newStatus
      });
      setTasks(tasks.map(t => t.id === taskId ? data : t));
      toast.success(`Task status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const openDeleteTaskModal = (taskId) => {
    setTaskToDeleteId(taskId);
    setIsDeleteTaskOpen(true);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDeleteId) return;
    try {
      await api.delete(`/tasks/${taskToDeleteId}`);
      setTasks(tasks.filter(t => t.id !== taskToDeleteId));
      toast.success('Task deleted');
      setIsDeleteTaskOpen(false);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Time log operations
  const openDeleteLogModal = (logId) => {
    setLogToDeleteId(logId);
    setIsDeleteLogOpen(true);
  };

  const handleDeleteLogConfirm = async () => {
    if (!logToDeleteId) return;
    try {
      await api.delete(`/timelogs/${logToDeleteId}`);
      setLogs(logs.filter(l => l.id !== logToDeleteId));
      toast.success('Time log deleted');
      setIsDeleteLogOpen(false);
      // Re-fetch project details for budget updates
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error('Failed to delete time log');
    }
  };

  // Quick Start Timer
  const handleQuickTimer = async (e) => {
    e.preventDefault();
    await start({ projectId: id, projectName: project.name, description: timerDesc });
    setTimerDesc('');
    setActiveTab('overview');
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  // Enriched metrics
  const totalBilledAmount = logs.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const burnRatePct = project.budget > 0 ? Math.min(100, Math.round((totalBilledAmount / project.budget) * 100)) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'tasks', label: 'Tasks List', icon: FiCheckSquare },
    { id: 'logs', label: 'Time Logs', icon: FiClock },
    { id: 'quick-timer', label: 'Quick Timer', icon: FiPlay },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (isEditProjectOpen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProjectOpen(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-border text-neutral-text-secondary hover:text-neutral-text-primary transition shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight font-black">Modify Project Settings</h2>
            <p className="text-sm text-neutral-text-secondary">Update details and configurations for project "{project?.name}".</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 max-w-3xl">
          <form onSubmit={handleEditProject} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Project Name*</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 Months, 15 Days"
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
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">
                  {billingType === 'fixed' ? 'Total Project Cost (Fixed)*' : 'Project Budget'}
                </label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
                {billingType === 'fixed' && (
                  <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Note: Billed amount will be locked to this flat rate.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-text-secondary mb-1">Color Theme</label>
                <div className="flex items-center gap-1.5 py-1">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-6 h-6 rounded-full border-2 transition transform hover:scale-110 flex-shrink-0"
                      style={{ 
                        backgroundColor: c,
                        borderColor: color === c ? '#1E293B' : 'transparent' 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsEditProjectOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddTaskOpen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTaskOpen(false)}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-border text-neutral-text-secondary hover:text-neutral-text-primary transition shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight font-black">Create New Task</h2>
            <p className="text-sm text-neutral-text-secondary">Define a new task requirement under project "{project?.name}".</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 md:p-8 max-w-3xl">
          <form onSubmit={handleAddTask} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Task Title*</label>
              <input 
                type="text" 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Integrate Stripe Payment"
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Description</label>
              <textarea 
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Add details for this task..."
                rows={2}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Priority</label>
                <select 
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-2 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Assigned Time (Hours)</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  value={taskEstimatedHours}
                  onChange={(e) => setTaskEstimatedHours(e.target.value)}
                  placeholder="e.g. 5, 8.5"
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">Due Date</label>
                <input 
                  type="date" 
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsAddTaskOpen(false)}
                className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-text-secondary hover:text-neutral-text-primary transition">
            <FiArrowLeft />
            <span>Back to Projects list</span>
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">{project.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-border bg-white hover:bg-slate-50 text-neutral-text-secondary hover:text-neutral-text-primary text-xs font-bold rounded-lg transition"
          >
            <FiSettings size={14} />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setIsDeleteProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-transparent bg-danger-light/10 text-danger hover:bg-danger/10 text-xs font-bold rounded-lg transition"
          >
            <FiTrash2 size={14} />
            <span>Delete Project</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-border gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 uppercase tracking-wider relative ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-neutral-text-secondary hover:text-neutral-text-primary'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Block: Budget burn & progress info */}
          <div className="lg:col-span-2 bg-white border border-neutral-border rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider">Financial Overview</h3>
            <div className="p-4 bg-slate-50 border border-neutral-border rounded-xl">
              <BurnRateBar 
                percentage={burnRatePct}
                budget={project.budget}
                spent={totalBilledAmount}
                currency={project.currency}
              />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <span className="block text-[10px] text-neutral-text-muted uppercase font-bold tracking-wider">Total Time Logged</span>
                <span className="text-lg font-extrabold text-neutral-text-primary font-mono">{formatDuration(totalMinutes)}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-neutral-text-muted uppercase font-bold tracking-wider">Tasks Complete</span>
                <span className="text-lg font-extrabold text-neutral-text-primary">{completedTasksCount}/{tasks.length}</span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="block text-[10px] text-neutral-text-muted uppercase font-bold tracking-wider">
                  {project.billing_type === 'fixed' ? 'Contract Value' : 'Earned Amount'}
                </span>
                <span className="text-lg font-extrabold text-success font-mono">
                  {formatCurrency(project.billing_type === 'fixed' ? project.budget : totalBilledAmount, project.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Block: Project Metadata Details */}
          <div className="bg-white border border-neutral-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
            <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider">Details</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-neutral-text-secondary font-medium">Client</span>
                <Link to={`/clients/${project.client_id}`} className="font-bold text-primary hover:underline">{project.client_name}</Link>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-neutral-text-secondary font-medium">Billing Model</span>
                <span className="font-bold uppercase text-indigo-600">
                  {project.billing_type === 'fixed' ? 'Fixed Price (Flat)' : 'Hourly Rate'}
                </span>
              </div>
              {project.billing_type !== 'fixed' ? (
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-neutral-text-secondary font-medium">Hourly Rate</span>
                  <span className="font-bold text-neutral-text-primary">{formatCurrency(project.hourly_rate, project.currency)}/hr</span>
                </div>
              ) : (
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-neutral-text-secondary font-medium">Contract Value</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(project.budget, project.currency)}</span>
                </div>
              )}
              {project.duration && (
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-neutral-text-secondary font-medium">Expected Duration</span>
                  <span className="font-bold text-neutral-text-primary">{project.duration}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-neutral-text-secondary font-medium">Start Date</span>
                <span className="font-bold text-neutral-text-primary">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-neutral-text-secondary font-medium">Due Date</span>
                <span className="font-bold text-neutral-text-primary">{formatDate(project.end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-text-secondary font-medium">Status</span>
                <span className="capitalize font-bold text-primary">{project.status.replace('_', ' ')}</span>
              </div>
            </div>

            {project.description && (() => {
              // Try parsing as checklist JSON
              let checklist = null;
              try {
                const parsed = JSON.parse(project.description);
                if (Array.isArray(parsed) && parsed.every(i => 'text' in i && 'status' in i)) {
                  checklist = parsed;
                }
              } catch (_) {}

              const statusStyles = {
                pending:     'bg-slate-100 text-slate-600 border-slate-200',
                in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                completed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
                on_hold:     'bg-amber-50 text-amber-700 border-amber-200',
                ask_client:  'bg-purple-50 text-purple-700 border-purple-200',
                confusing:   'bg-rose-50 text-rose-700 border-rose-200',
              };
              const statusLabels = {
                pending: 'Pending', in_progress: 'In Progress', completed: 'Completed',
                on_hold: 'On Hold', ask_client: 'Ask Client', confusing: 'Confusing',
              };

              if (checklist) {
                const done  = checklist.filter(i => i.status === 'completed').length;
                const total = checklist.length;
                const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div className="border-t border-slate-100 pt-6 space-y-3 text-xs">
                    <span className="block text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Project Checklist</span>
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-neutral-text-secondary">{done} of {total} completed</span>
                        <span className="font-black text-neutral-text-primary">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : '#4F46E5' }} />
                      </div>
                    </div>
                    {/* Items */}
                    <div className="space-y-1.5">
                      {checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center ${item.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                            {item.status === 'completed' && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={`flex-1 font-medium ${item.status === 'completed' ? 'line-through text-neutral-text-muted' : 'text-neutral-text-primary'}`}>{item.text}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${statusStyles[item.status] || statusStyles.pending}`}>
                            {statusLabels[item.status] || item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div className="border-t border-slate-100 pt-6 space-y-2 text-xs">
                  <span className="block text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Project Notes</span>
                  <p className="text-neutral-text-secondary leading-relaxed bg-slate-50 border border-neutral-border p-3 rounded-lg italic">
                    "{project.description}"
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-text-primary uppercase tracking-wider">Task List</h3>
            <button 
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <FiPlus size={14} />
              <span>Create Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-border rounded-xl bg-white p-6">
              <FiCheckSquare className="mx-auto text-neutral-text-muted mb-3" size={36} />
              <h4 className="text-sm font-bold text-neutral-text-primary">No tasks registered</h4>
              <p className="text-xs text-neutral-text-secondary max-w-sm mx-auto mt-1 mb-4">Add tasks to track project requirements and organize your developer flow.</p>
              <button 
                onClick={() => setIsAddTaskOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleTaskStatusChange} 
                  onDelete={openDeleteTaskModal} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TIME LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-6 bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-text-primary uppercase tracking-wider">Completed Time Logs</h3>
            <span className="text-xs font-semibold text-neutral-text-secondary">
              Total Logged: <span className="font-bold text-neutral-text-primary">{formatDuration(totalMinutes)}</span>
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-border rounded-xl">
              <FiClock className="mx-auto text-neutral-text-muted mb-2" size={32} />
              <p className="text-xs text-neutral-text-secondary">No recorded hours found for this project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-neutral-border">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-neutral-text-secondary tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Project / Details</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Rate</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Billing Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-border">
                  {logs.map(log => (
                    <TimeLogItem 
                      key={log.id} 
                      log={{ ...log, project_name: project.name, currency: project.currency }} 
                      onDelete={openDeleteLogModal} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUICK TIMER TAB */}
      {activeTab === 'quick-timer' && (
        <div className="max-w-md bg-white border border-neutral-border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider">Project Time Logger</h3>
          <p className="text-xs text-neutral-text-secondary leading-relaxed">
            Quickly trigger the global timer stopwatch for project **{project.name}**. Once started, the timer will tick in the Sidebar footer and survive page refreshes until stopped.
          </p>

          {isRunning ? (
            <div className="p-4 bg-slate-50 border border-neutral-border rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse" />
                <span className="font-semibold text-neutral-text-primary">Stopwatch active for: {timerData?.projectName}</span>
              </div>
              <button 
                onClick={stop}
                className="px-3 py-1.5 bg-danger hover:bg-red-600 text-white font-bold rounded-lg transition"
              >
                Stop Active Timer
              </button>
            </div>
          ) : (
            <form onSubmit={handleQuickTimer} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-neutral-text-secondary">What are you working on?</label>
                <input 
                  type="text" 
                  value={timerDesc}
                  onChange={(e) => setTimerDesc(e.target.value)}
                  placeholder="e.g. Building API endpoints, debugging state..."
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                />
              </div>
              <button 
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-md transition"
              >
                <FiPlay size={12} />
                <span>Start Session Stopwatch</span>
              </button>
            </form>
          )}
        </div>
      )}



      {/* Delete Project Modal */}
      <ConfirmDialog 
        isOpen={isDeleteProjectOpen} 
        title="Delete Project?"
        message={`Are you sure you want to delete project "${project.name}"? All associated tasks, time logs, and invoices will be deleted. This cannot be undone.`}
        confirmText="Yes, Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteProject}
        onCancel={() => setIsDeleteProjectOpen(false)}
      />



      {/* Delete Task Confirmation Modal */}
      <ConfirmDialog 
        isOpen={isDeleteTaskOpen} 
        title="Delete Task?"
        message="Are you sure you want to delete this task? This will remove all logging entries pointing to this task too."
        confirmText="Delete Task"
        cancelText="Cancel"
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => setIsDeleteTaskOpen(false)}
      />

      {/* Delete Time Log Confirmation Modal */}
      <ConfirmDialog 
        isOpen={isDeleteLogOpen} 
        title="Delete Time Log?"
        message="Are you sure you want to delete this billable log entry? The project burn rate budget usage will be decremented accordingly."
        confirmText="Delete Entry"
        cancelText="Cancel"
        onConfirm={handleDeleteLogConfirm}
        onCancel={() => setIsDeleteLogOpen(false)}
      />
    </div>
  );
};

export default ProjectDetail;
