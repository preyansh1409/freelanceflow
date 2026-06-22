import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiPlus, FiTrash2, FiChevronDown, FiClipboard, FiCheck, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

const TODO_STATUSES = [
  { value: 'pending',     label: 'Pending',     dot: '#94a3b8', pill: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'in_progress', label: 'In Progress', dot: '#3b82f6', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'completed',   label: 'Completed',   dot: '#10b981', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'on_hold',     label: 'On Hold',     dot: '#f59e0b', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'ask_client',  label: 'Ask Client',  dot: '#8b5cf6', pill: 'bg-violet-50 text-violet-700 border-violet-200' },
  { value: 'confusing',   label: 'Confusing',   dot: '#ef4444', pill: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const getStatusCfg = (val) => TODO_STATUSES.find(s => s.value === val) || null;

const parseChecklist = (raw) => {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p) && p.every(i => 'text' in i && 'status' in i)) return p;
  } catch (_) {}
  return null;
};

const Tasks = () => {
  const [loading,  setLoading]  = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [checklistProjectId, setChecklistProjectId] = useState('');
  const [checklistItems,     setChecklistItems]     = useState([]);
  const [isEditing,          setIsEditing]          = useState(false);
  const [saving,             setSaving]             = useState(false);
  const [filterMode,         setFilterMode]         = useState('configured');
  const [isCreateModalOpen,      setIsCreateModalOpen]      = useState(false);
  const [selectedModalProjectId, setSelectedModalProjectId] = useState('');
  const [focusedIndex,       setFocusedIndex]       = useState(null);

  const checklistProject = checklistProjectId
    ? projects.find(p => String(p.id) === String(checklistProjectId))
    : null;

  useEffect(() => {
    (async () => {
      try {
        const [projRes, clientRes] = await Promise.all([
          api.get('/projects'),
          api.get('/clients')
        ]);
        setProjects(projRes.data);
        setClients(clientRes.data);
      }
      catch { toast.error('Could not load checklist data'); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (focusedIndex !== null) {
      const input = document.getElementById(`checklist-item-input-${focusedIndex}`);
      if (input) {
        input.focus();
        setFocusedIndex(null);
      }
    }
  }, [focusedIndex, checklistItems]);

  const openEdit = (projId) => {
    const proj = projId ? projects.find(p => String(p.id) === String(projId)) : null;
    const ex = proj ? parseChecklist(proj.description) || [] : [];
    const items = ex.length > 0
      ? ex.map(i => ({ ...i }))
      : [{ text: '', status: '' }];
    setChecklistProjectId(projId);
    setChecklistItems(items);
    setIsEditing(true);
    setFocusedIndex(ex.length > 0 ? null : 0);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setChecklistProjectId('');
    setChecklistItems([]);
    setFocusedIndex(null);
  };

  const addItem    = () => {
    setChecklistItems(p => {
      setFocusedIndex(p.length);
      return [...p, { text: '', status: '' }];
    });
  };
  const removeItem = (i) => setChecklistItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) =>
    setChecklistItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const saveChecklist = async () => {
    const proj = checklistProject;
    if (!proj) return;
    const cleaned = checklistItems.filter(i => i.text.trim());
    if (!cleaned.length) { toast.error('Add at least one item.'); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/projects/${proj.id}`, {
        name: proj.name, description: JSON.stringify(cleaned),
        status: proj.status, billing_type: proj.billing_type,
        duration: proj.duration, budget: proj.budget,
        start_date: proj.start_date, end_date: proj.end_date, color: proj.color,
      });
      setProjects(projects.map(p => p.id === proj.id ? { ...p, description: data.description } : p));
      setIsEditing(false);
      setChecklistProjectId('');
      toast.success('Checklist saved!');
    } catch { toast.error('Failed to save checklist'); }
    finally { setSaving(false); }
  };

  const toggleTaskStatus = async (projectId, taskIndex) => {
    const proj = projects.find(p => String(p.id) === String(projectId));
    if (!proj) return;

    const items = parseChecklist(proj.description) || [];
    if (!items[taskIndex]) return;

    const wasCompleted = items[taskIndex].status === 'completed';
    items[taskIndex].status = wasCompleted ? 'pending' : 'completed';

    try {
      const { data } = await api.put(`/projects/${proj.id}`, {
        name: proj.name,
        description: JSON.stringify(items),
        status: proj.status,
        billing_type: proj.billing_type,
        duration: proj.duration,
        budget: proj.budget,
        start_date: proj.start_date,
        end_date: proj.end_date,
        color: proj.color,
      });

      setProjects(projects.map(p => p.id === proj.id ? { ...p, description: data.description } : p));
      toast.success(wasCompleted ? 'Task marked as pending' : 'Task marked as completed!');
    } catch {
      toast.error('Failed to update task status');
    }
  };

  const getGroupedProjects = () => {
    const grouped = [];
    projects.forEach(proj => {
      const items = parseChecklist(proj.description) || [];
      
      const hasTasks = items.length > 0;
      if (filterMode === 'configured' && !hasTasks) return;
      if (filterMode === 'pending' && hasTasks) return;

      const client = clients.find(c => String(c.id) === String(proj.client_id));
      
      const total = items.length;
      const completed = items.filter(i => i.status === 'completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      grouped.push({
        projectId: proj.id,
        projectName: proj.name,
        projectColor: proj.color,
        clientName: client ? client.name : 'N/A',
        startDate: proj.start_date,
        dueDate: proj.end_date,
        tasks: items,
        progressPct: progress
      });
    });
    // Sort projects so that completed ones (progressPct === 100) are placed at the very end
    grouped.sort((a, b) => {
      if (a.progressPct === 100 && b.progressPct !== 100) return 1;
      if (a.progressPct !== 100 && b.progressPct === 100) return -1;
      return 0;
    });
    return grouped;
  };

  const groupedProjects = getGroupedProjects();

  const HINTS = ['Create frontend UI', 'Setup backend server', 'Configure database', 'Buy domain name', 'Setup hosting', 'Client feedback', 'SEO & meta tags', 'Deploy to production'];

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black text-neutral-text-primary tracking-tight">Tasks</h2>
            <p className="text-sm text-neutral-text-secondary">Track every deliverable for your projects.</p>
          </div>

          {/* Segmented Controller (Burger-style Pill Switcher) */}
          {!isEditing && (
            <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit border border-slate-200">
              <button
                onClick={() => setFilterMode('configured')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  filterMode === 'configured'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                }`}
              >
                Tasks Configured
              </button>
              <button
                onClick={() => setFilterMode('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  filterMode === 'pending'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                }`}
              >
                Pending Setup
              </button>
            </div>
          )}
        </div>

        {/* Right side Create Task Button */}
        {!isEditing && (
          <button
            onClick={() => {
              setSelectedModalProjectId(projects[0]?.id || '');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <FiPlus size={14} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden">

        {/* ── Body ── */}
        {!isEditing ? (
          /* VIEW MODE */
          <>
            {groupedProjects.length > 0 ? (
              <div className="p-4 space-y-4">
                {/* Excel-style table */}
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-3 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-center w-12">#</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left">Client Name</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left">Project Title</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left">Task</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left w-36">Status</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left w-32">Start Date</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left w-32">Due Date</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-center w-28">Progress</th>
                        <th className="border border-slate-300 px-4 py-2.5 text-xs uppercase font-bold text-neutral-text-secondary tracking-wider text-left w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedProjects.map((proj, projIdx) => {
                        const numRows = proj.tasks.length || 1;
                        if (proj.tasks.length === 0) {
                          return (
                            <tr key={proj.projectId} className={projIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100/50 transition-colors'}>
                              <td className="border border-slate-300 px-3 py-2.5 text-center bg-slate-50 font-black text-slate-600 align-middle text-sm">
                                {projIdx + 1}
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary align-middle">
                                {proj.clientName}
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary align-middle">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.projectColor }} />
                                  <span>{proj.projectName}</span>
                                </div>
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm italic text-neutral-text-muted align-middle">
                                No checklist tasks added yet
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm align-middle text-neutral-text-muted">
                                —
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary font-mono align-middle">
                                {proj.startDate ? formatDate(proj.startDate) : 'N/A'}
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary font-mono align-middle">
                                {proj.dueDate ? formatDate(proj.dueDate) : 'N/A'}
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-bold align-middle text-center bg-slate-50 text-neutral-text-muted">
                                0%
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm space-x-1 whitespace-nowrap align-middle">
                                <button
                                  onClick={() => openEdit(proj.projectId)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded transition cursor-pointer"
                                  title="Create Checklist"
                                >
                                  <FiPlus size={12} />
                                  <span>Create</span>
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        return proj.tasks.map((task, taskIdx) => {
                          const isFirst = taskIdx === 0;
                          return (
                            <tr key={`${proj.projectId}-${taskIdx}`} className={projIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100/50 transition-colors'}>
                              {isFirst && (
                                <>
                                  <td rowSpan={numRows} className="border border-slate-300 px-3 py-2.5 text-center bg-slate-50 font-black text-slate-600 align-middle text-sm">
                                    {projIdx + 1}
                                  </td>
                                  <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary align-middle">
                                    {proj.clientName}
                                  </td>
                                  <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary align-middle">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.projectColor }} />
                                      <span>{proj.projectName}</span>
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary align-middle">
                                <div className="flex items-center gap-2.5">
                                  {task.status === 'completed' ? (
                                    <div
                                      className="w-5 h-5 rounded-full flex-shrink-0 bg-success border-2 border-success flex items-center justify-center text-white cursor-default"
                                      title="Completed"
                                    >
                                      <FiCheck size={12} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => toggleTaskStatus(proj.projectId, taskIdx)}
                                      className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-slate-300 hover:border-success hover:bg-success-light/30 flex items-center justify-center text-transparent hover:text-success transition cursor-pointer"
                                      title="Mark Complete"
                                    >
                                      <FiCheck size={12} strokeWidth={3} />
                                    </button>
                                  )}
                                  <span className={task.status === 'completed' ? 'line-through text-neutral-text-muted font-normal' : ''}>
                                    {task.text}
                                  </span>
                                </div>
                              </td>
                              <td className="border border-slate-300 px-4 py-2.5 text-sm align-middle">
                                {task.status && getStatusCfg(task.status) ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusCfg(task.status).pill}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusCfg(task.status).dot }} />
                                    {getStatusCfg(task.status).label}
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium text-neutral-text-muted">—</span>
                                )}
                              </td>
                              {isFirst && (
                                <>
                                  <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary font-mono align-middle">
                                    {proj.startDate ? formatDate(proj.startDate) : 'N/A'}
                                  </td>
                                  <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-neutral-text-primary font-mono align-middle">
                                    {proj.dueDate ? formatDate(proj.dueDate) : 'N/A'}
                                  </td>
                                  <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm font-bold align-middle text-center bg-slate-50">
                                    <span className={proj.progressPct === 100 ? 'text-success' : 'text-primary'}>
                                      {proj.progressPct}%
                                    </span>
                                  </td>
                                </>
                              )}
                              {isFirst && (
                                <td rowSpan={numRows} className="border border-slate-300 px-4 py-2.5 text-sm space-x-1 whitespace-nowrap align-middle">
                                  <button
                                    onClick={() => openEdit(proj.projectId)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 text-neutral-text-secondary hover:text-primary hover:border-primary font-bold text-xs rounded transition cursor-pointer"
                                    title="Edit Checklist"
                                  >
                                    <FiEdit size={12} />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* No project found for the selected filter mode */
              <div className="py-10 flex flex-col items-center text-center px-4">
                <FiClipboard size={24} className="text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-neutral-text-secondary">
                  {filterMode === 'configured' ? 'No configured tasks found' : 'All checklists are configured'}
                </p>
                <p className="text-[11px] text-neutral-text-muted mt-0.5">
                  {filterMode === 'configured' ? (
                    <>
                      All checklists are pending configuration.{' '}
                      <button
                        onClick={() => setFilterMode('pending')}
                        className="text-primary hover:underline font-bold transition cursor-pointer"
                      >
                        View Pending Setup
                      </button>
                    </>
                  ) : (
                    <>
                      All projects have their tasks configured.{' '}
                      <button
                        onClick={() => setFilterMode('configured')}
                        className="text-primary hover:underline font-bold transition cursor-pointer"
                      >
                        View Configured Tasks
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}
          </>
        ) : (
          /* EDIT MODE */
          <div className="space-y-0">
            {/* Contextual header bar for Edit Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/60">
              <p className="text-[11px] text-slate-600 font-semibold">
                Add deliverables for <strong className="text-slate-800">{checklistProject?.name || ''}</strong> and set a status for each.
              </p>
              <div className="flex gap-1.5 self-end sm:self-auto">
                <button onClick={cancelEdit} className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-neutral-text-secondary text-[11px] font-bold rounded-lg transition cursor-pointer">Cancel</button>
                <button onClick={saveChecklist} disabled={saving} className="px-2.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-lg transition cursor-pointer disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>

            {/* Excel-style table */}
            <div className="border-t border-slate-200 overflow-x-auto">
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>

                {/* Header row */}
                <thead>
                  <tr style={{ background: '#e2e8f0' }}>
                    <th className="border border-slate-400 px-3 py-2.5 text-xs font-black text-slate-700 uppercase tracking-wider text-center w-12">#</th>
                    <th className="border border-slate-400 px-4 py-2.5 text-xs font-black text-slate-700 uppercase tracking-wider text-left">Todo Item / Deliverable</th>
                    <th className="border border-slate-400 px-4 py-2.5 text-xs font-black text-slate-700 uppercase tracking-wider text-center w-44">Status</th>
                    <th className="border border-slate-400 px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>

                {/* Body rows */}
                <tbody>
                  {checklistItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>

                      {/* Row number */}
                      <td className="border border-slate-300 px-3 py-0 text-center bg-slate-100">
                        <span className="text-sm font-black text-slate-600">{idx + 1}</span>
                      </td>

                      {/* Todo input */}
                      <td className="border border-slate-300 p-0">
                        <input
                          id={`checklist-item-input-${idx}`}
                          type="text"
                          value={item.text}
                          onChange={e => updateItem(idx, 'text', e.target.value)}
                          placeholder={HINTS[idx % HINTS.length]}
                          className="w-full h-full px-4 py-2.5 bg-transparent text-sm font-semibold text-slate-800 focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-primary placeholder:text-slate-400 placeholder:font-normal transition-colors"
                        />
                      </td>

                      {/* Status select */}
                      <td className="border border-slate-300 p-0">
                        <div className="relative w-full">
                          <select
                            value={item.status}
                            onChange={e => updateItem(idx, 'status', e.target.value)}
                            className={`w-full px-4 pr-8 py-2.5 text-sm font-bold focus:outline-none focus:bg-blue-50 cursor-pointer appearance-none bg-transparent transition-colors ${
                              item.status && getStatusCfg(item.status)
                                ? getStatusCfg(item.status).pill.split(' ').filter(c => c.startsWith('text-')).join(' ')
                                : 'text-slate-400'
                            }`}
                          >
                            <option value="" disabled hidden>— choose —</option>
                            {TODO_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <FiChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="border border-slate-300 px-2 py-0 text-center bg-slate-100">
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete row"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add row — last row of table */}
                  <tr className="bg-white">
                    <td colSpan={4} className="border border-slate-300 p-0">
                      <button
                        onClick={addItem}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-black text-slate-500 hover:text-primary hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <FiPlus size={15} /> Add Row
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-base font-bold text-neutral-text-primary mb-2">Create Task Checklist</h3>
              <p className="text-xs text-neutral-text-secondary mb-4">
                Select a project to configure or add deliverables to its checklist.
              </p>
              
              <div className="relative">
                <select
                  value={selectedModalProjectId}
                  onChange={e => setSelectedModalProjectId(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-neutral-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="" disabled>-- Select a Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text-muted pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-neutral-border">
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)} 
                className="px-4 py-2 text-xs font-semibold text-neutral-text-secondary hover:text-neutral-text-primary bg-white border border-neutral-border rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (selectedModalProjectId) {
                    openEdit(selectedModalProjectId);
                    setIsCreateModalOpen(false);
                  }
                }}
                disabled={!selectedModalProjectId}
                className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
