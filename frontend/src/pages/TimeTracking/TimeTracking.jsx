import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTimer } from '../../context/TimerContext';
import TimeLogItem from '../../components/TimeLogItem/TimeLogItem';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Modal from '../../components/Modal/Modal';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FiClock, FiPlus, FiSquare, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';
import toast from 'react-hot-toast';

const TimeTracking = () => {
  const { isRunning, timerData, formatElapsed, stop } = useTimer();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [infoProjectId, setInfoProjectId] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Filters state
  const [projectFilter, setProjectFilter] = useState('');
  const [billedFilter, setBilledFilter] = useState('');

  // Modals state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [logToDeleteId, setLogToDeleteId] = useState(null);

  // Manual Entry Form fields
  const [manualProjectId, setManualProjectId] = useState('');
  const [manualTaskId, setManualTaskId] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('11:00');
  const [manualRate, setManualRate] = useState('0');

  const fetchLogs = async () => {
    try {
      // Build query string
      let query = '/timelogs';
      const params = [];
      if (projectFilter) params.push(`project_id=${projectFilter}`);
      if (billedFilter !== '') params.push(`is_billed=${billedFilter}`);
      if (params.length > 0) {
        query += `?${params.join('&')}`;
      }

      const [logsRes, projectsRes] = await Promise.all([
        api.get(query),
        api.get('/projects')
      ]);

      setLogs(logsRes.data);
      setProjects(projectsRes.data);

      if (projectsRes.data.length > 0 && !manualProjectId) {
        setManualProjectId(projectsRes.data[0].id);
      }
    } catch (err) {
      toast.error('Could not fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [projectFilter, billedFilter]);

  // Load tasks when manual project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!manualProjectId) return;
      try {
        const { data } = await api.get(`/tasks/project/${manualProjectId}`);
        setTasks(data);
        setManualTaskId('');
      } catch (err) {
        // Gracefully ignore
      }
    };

    // Prefill hourly rate based on client rate
    const proj = projects.find(p => String(p.id) === String(manualProjectId));
    if (proj) {
      setManualRate(String(proj.hourly_rate));
    }

    fetchTasks();
  }, [manualProjectId, projects]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualProjectId || !manualStartTime || !manualEndTime) {
      toast.error('Project, start time, and end time are required');
      return;
    }

    // Combine date & time
    const startISO = new Date(`${manualDate}T${manualStartTime}:00`).toISOString();
    const endISO = new Date(`${manualDate}T${manualEndTime}:00`).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const { data } = await api.post('/timelogs/manual', {
        project_id: manualProjectId,
        task_id: manualTaskId || null,
        description: manualDescription,
        start_time: startISO,
        end_time: endISO,
        hourly_rate: parseFloat(manualRate || 0)
      });
      
      // enrich project details in response
      const proj = projects.find(p => String(p.id) === String(manualProjectId));
      const enriched = {
        ...data,
        project_name: proj ? proj.name : 'Unknown',
        client_name: proj ? proj.client_name : '',
        currency: proj ? proj.currency : 'INR'
      };

      setLogs([enriched, ...logs]);
      toast.success('Manual time log added');
      setIsManualOpen(false);
      
      // Reset form description
      setManualDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add manual log');
    }
  };

  const openDeleteModal = (logId) => {
    setLogToDeleteId(logId);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!logToDeleteId) return;
    try {
      await api.delete(`/timelogs/${logToDeleteId}`);
      setLogs(logs.filter(l => l.id !== logToDeleteId));
      toast.success('Time log deleted');
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete time log');
    }
  };

  // Helper: Live calculation of duration minutes inside manual entry modal
  const getManualDuration = () => {
    if (!manualStartTime || !manualEndTime) return 0;
    const startMs = new Date(`${manualDate}T${manualStartTime}:00`).getTime();
    const endMs = new Date(`${manualDate}T${manualEndTime}:00`).getTime();
    const mins = Math.round((endMs - startMs) / 60000);
    return mins > 0 ? mins : 0;
  };

  const handleUpdateStatus = async (proj, newStatus) => {
    try {
      const payload = {
        client_id: proj.client_id,
        name: proj.name,
        description: proj.description || null,
        status: newStatus,
        billing_type: proj.billing_type || 'hourly',
        duration: proj.duration || null,
        budget: parseFloat(proj.budget || 0),
        start_date: proj.start_date ? proj.start_date.substring(0, 10) : null,
        end_date: proj.end_date ? proj.end_date.substring(0, 10) : null,
        color: proj.color || '#4F46E5'
      };
      await api.put(`/projects/${proj.id}`, payload);
      
      // Update local projects list status
      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, status: newStatus } : p));
      toast.success(`Status updated to ${newStatus === 'complete' ? 'Complete' : 'Incomplete'}`);
    } catch (err) {
      toast.error('Failed to update project status');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">Time Tracking</h2>
          <p className="text-sm text-neutral-text-secondary">Track client project billable hours dynamically or add manual entries.</p>
        </div>
        <button 
          onClick={() => {
            if (projects.length === 0) {
              toast.error('Create a project first before logging hours.');
              return;
            }
            setIsManualOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Add Manual Entry</span>
        </button>
      </div>

      {/* Active Timer Row Card */}
      {isRunning && timerData && (
        <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full text-white">
              <FiClock size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stopwatch Active</span>
              <h4 className="text-base font-black truncate max-w-sm">{timerData.projectName}</h4>
              {timerData.description && (
                <p className="text-xs text-slate-300 italic truncate max-w-sm mt-0.5">"{timerData.description}"</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-3xl font-mono font-bold tracking-widest">{formatElapsed()}</span>
            <button 
              onClick={() => { stop().then(() => fetchLogs()); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-danger hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-danger/25 transition cursor-pointer"
            >
              <FiSquare size={12} />
              <span>Stop & Save Log</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-neutral-border rounded-xl shadow-sm text-xs font-semibold">
        <div className="space-y-1">
          <label className="block text-neutral-text-secondary">Filter by Project</label>
          <select 
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-neutral-text-secondary">Filter by Billing status</label>
          <select 
            value={billedFilter}
            onChange={(e) => setBilledFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
          >
            <option value="">All Logs</option>
            <option value="0">Unbilled</option>
            <option value="1">Billed</option>
          </select>
        </div>
      </div>

      {/* ── All Projects Overview ─────────────────────────────────────────── */}
      <div className="-mx-2 md:-mx-6 lg:-mx-12 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-200 bg-white">
          <span className="text-base font-black text-black uppercase tracking-widest text-center block">Projects Overview</span>
        </div>

        {projects.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 font-medium">No projects found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-black">
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Project</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Client Name</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Description</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Amount</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Start Date</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">End Date</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Time Left</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Status</th>
                  <th className="border border-slate-300 px-3 py-3 text-sm font-black uppercase tracking-wide text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj, i) => {
                  const today    = new Date();
                  const endDate  = proj.end_date ? new Date(proj.end_date) : null;
                  const daysLeft = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;
                  const rowBg    = i % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const status   = (proj.status === 'complete' || proj.status === 'completed') ? 'complete' : 'incomplete';
                  const isEditing = editingProjectId === proj.id;

                  let description = '—';
                  if (proj.description) {
                    try {
                      const parsed = JSON.parse(proj.description);
                      description = Array.isArray(parsed) ? `${parsed.length} tasks` : proj.description;
                    } catch { description = proj.description; }
                  }

                  return (
                    <tr key={proj.id} style={{ background: rowBg }} className="hover:bg-slate-100/70 transition-colors">
                      {/* Project */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center">
                        <span className="font-normal text-slate-800 text-sm">{proj.name}</span>
                      </td>

                      {/* Client Name */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        {proj.client_name || '—'}
                      </td>

                      {/* Description */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800" title={description}>
                        <span className="line-clamp-1">{description}</span>
                      </td>

                      {/* Amount */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        {proj.budget ? formatCurrency(parseFloat(proj.budget), proj.currency || 'INR') : '—'}
                      </td>

                      {/* Start Date */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        {proj.start_date ? new Date(proj.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* End Date */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        <span>
                          {endDate ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      {/* Time Left */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        {daysLeft === null ? (
                          '—'
                        ) : daysLeft < 0 ? (
                          `${Math.abs(daysLeft)}d overdue`
                        ) : daysLeft <= 7 ? (
                          `${daysLeft}d left`
                        ) : (
                          `${daysLeft} days`
                        )}
                      </td>

                      {/* Status */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center text-sm font-normal text-slate-800">
                        {isEditing ? (
                          <div className="relative inline-block text-left">
                            <select
                              value={status}
                              onChange={e => {
                                handleUpdateStatus(proj, e.target.value);
                                setEditingProjectId(null);
                              }}
                              autoFocus
                              onBlur={() => setEditingProjectId(null)}
                              className="appearance-none pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs font-normal cursor-pointer focus:outline-none bg-white text-slate-800"
                            >
                              <option value="incomplete">Incomplete</option>
                              <option value="complete">Complete</option>
                            </select>
                            <FiChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600" />
                          </div>
                        ) : (
                          status === 'complete' ? 'Complete' : 'Incomplete'
                        )}
                      </td>

                      {/* Action */}
                      <td className="border border-slate-300 px-3 py-2.5 text-center">
                        <button
                          onClick={() => setEditingProjectId(isEditing ? null : proj.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-normal rounded-lg transition cursor-pointer border border-slate-300"
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
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

      {/* Manual Entry Modal */}
      <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} title="Log Manual Time Entry">
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Project*</label>
              <select 
                value={manualProjectId}
                onChange={(e) => setManualProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Link to Task (Optional)</label>
              <select 
                value={manualTaskId}
                onChange={(e) => setManualTaskId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border bg-white rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
              >
                <option value="">No task selected</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-neutral-text-secondary">Work Description</label>
            <input 
              type="text" 
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="e.g. Design review, backend architecture layout..."
              className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Log Date</label>
              <input 
                type="date" 
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Start Time</label>
              <input 
                type="time" 
                value={manualStartTime}
                onChange={(e) => setManualStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">End Time</label>
              <input 
                type="time" 
                value={manualEndTime}
                onChange={(e) => setManualEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="block text-neutral-text-secondary">Hourly Rate (Pre-filled)</label>
              <input 
                type="number" 
                value={manualRate}
                onChange={(e) => setManualRate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-primary text-xs font-normal font-mono"
                required
              />
            </div>

            {getManualDuration() > 0 && (
              <div className="p-3 bg-slate-50 border border-neutral-border rounded-lg text-xs space-y-1 text-neutral-text-secondary mt-5">
                <div>Calculated Duration: <span className="font-bold text-neutral-text-primary font-mono">{formatDuration(getManualDuration())}</span></div>
                <div>Amount due: <span className="font-bold text-success font-mono">{formatCurrency((getManualDuration() / 60) * parseFloat(manualRate || 0), projects.find(p => String(p.id) === String(manualProjectId))?.currency)}</span></div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
            <button 
              type="button" 
              onClick={() => setIsManualOpen(false)}
              className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-text-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              Log Time
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Delete Time Log?"
        message="Are you sure you want to delete this billable log entry? The client project budget spent usages will be reduced."
        confirmText="Delete Log"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default TimeTracking;
