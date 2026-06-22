import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckSquare, FiEdit, FiTrash2, FiClock } from 'react-icons/fi';
import { formatDate, isOverdue } from '../../utils/formatDate';
import BurnRateBar from '../BurnRateBar/BurnRateBar';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const statusLabels = {
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusColors = {
    active: 'bg-success-light text-success border-success/20',
    on_hold: 'bg-warning-light text-warning border-warning/20',
    completed: 'bg-slate-100 text-neutral-text-secondary border-neutral-border',
    cancelled: 'bg-danger-light text-danger border-danger/20',
  };

  const isProjectOverdue = project.status === 'active' && project.end_date && isOverdue(project.end_date);

  return (
    <div 
      className="bg-white border border-neutral-border rounded-xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
      style={{ borderLeftWidth: '5px', borderLeftColor: project.color || '#4F46E5' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <Link to={`/projects/${project.id}`} className="font-bold text-neutral-text-primary hover:text-primary transition text-base line-clamp-1">
              {project.name}
            </Link>
            <span className="text-xs text-neutral-text-secondary font-medium block">
              Client: {project.client_name} {project.client_company ? `(${project.client_company})` : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                project.billing_type === 'fixed' 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {project.billing_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
              </span>
              {project.duration && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-neutral-text-secondary border border-slate-200">
                  {project.duration}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[project.status] || statusColors.active}`}>
            {statusLabels[project.status] || project.status}
          </span>
        </div>

        {project.description && (() => {
          let checklist = null;
          try {
            const parsed = JSON.parse(project.description);
            if (Array.isArray(parsed) && parsed.every(i => 'text' in i && 'status' in i)) checklist = parsed;
          } catch (_) {}

          if (checklist && checklist.length > 0) {
            const done       = checklist.filter(i => i.status === 'completed').length;
            const inProgress = checklist.filter(i => i.status === 'in_progress').length;
            const pending    = checklist.filter(i => i.status === 'pending').length;
            const pct        = Math.round((done / checklist.length) * 100);
            return (
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-neutral-text-muted">{done}/{checklist.length} tasks done</span>
                  <span className="font-black text-neutral-text-primary">{pct}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : '#4F46E5' }} />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {done > 0       && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ {done} done</span>}
                  {inProgress > 0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">⏳ {inProgress} in progress</span>}
                  {pending > 0    && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{pending} pending</span>}
                </div>
              </div>
            );
          }
          return (
            <p className="text-xs text-neutral-text-secondary line-clamp-2 mb-4 leading-relaxed">
              {project.description}
            </p>
          );
        })()}

        <div className="mb-4">
          <BurnRateBar 
            percentage={project.burn_rate_pct || 0} 
            budget={project.budget} 
            spent={project.total_billed_amount || 0}
            currency={project.currency}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-text-secondary border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5">
            <FiCheckSquare className="text-neutral-text-muted" />
            <span>Tasks: <span className="font-semibold text-neutral-text-primary">{project.done_tasks || 0}/{project.task_count || 0}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiClock className="text-neutral-text-muted" />
            <span>Logged: <span className="font-semibold text-neutral-text-primary">{Math.round((project.total_minutes || 0) / 60)} hrs</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-neutral-border">
        <div className="flex items-center gap-1.5 text-xs">
          <FiCalendar className={isProjectOverdue ? 'text-danger animate-pulse' : 'text-neutral-text-muted'} />
          <span className={isProjectOverdue ? 'text-danger font-bold' : 'text-neutral-text-secondary font-medium'}>
            {isProjectOverdue ? 'Overdue: ' : 'Due: '} {formatDate(project.end_date)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => onEdit(project)} 
            className="p-1 rounded-lg text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-slate-100 transition"
            title="Edit Project"
          >
            <FiEdit size={14} />
          </button>
          <button 
            type="button"
            onClick={() => onDelete(project)} 
            className="p-1 rounded-lg text-danger hover:text-red-700 hover:bg-danger-light/30 transition"
            title="Delete Project"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
