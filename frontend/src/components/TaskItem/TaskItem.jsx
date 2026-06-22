import React from 'react';
import { FiCalendar, FiTrash2, FiClock } from 'react-icons/fi';
import { formatDate, isOverdue } from '../../utils/formatDate';
import { format } from 'date-fns';

const TaskItem = ({ task, onStatusChange, onDelete }) => {
  const priorityColors = {
    low: 'bg-slate-400',
    medium: 'bg-info',
    high: 'bg-warning',
    urgent: 'bg-danger',
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'In Review',
    done: 'Completed',
  };

  const isTaskOverdue = task.status !== 'done' && task.due_date && isOverdue(task.due_date);
  const isTaskDueToday = task.status !== 'done' && task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-neutral-border rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3 flex-1">
        <span 
          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}
          title={`Priority: ${task.priority}`}
        />
        <div className="overflow-hidden">
          <h4 className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-neutral-text-muted' : 'text-neutral-text-primary'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-neutral-text-secondary mt-0.5 line-clamp-1 italic">
              {task.description}
            </p>
          )}
          <p className="text-[11px] text-neutral-text-muted mt-1">
            Project: <span className="font-semibold text-neutral-text-secondary">{task.project_name || 'Project'}</span>
            {task.client_name && ` — Client: ${task.client_name}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 text-xs">
        {task.estimated_hours !== null && task.estimated_hours !== undefined && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex-shrink-0" title="Assigned time/duration">
            <FiClock size={11} className="text-indigo-400" />
            <span>{task.estimated_hours} hrs</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <FiCalendar className={isTaskOverdue ? 'text-danger animate-pulse' : isTaskDueToday ? 'text-warning' : 'text-neutral-text-muted'} />
          <span className={`font-medium ${isTaskOverdue ? 'text-danger font-bold animate-pulse' : isTaskDueToday ? 'text-warning font-semibold' : 'text-neutral-text-secondary'}`}>
            {formatDate(task.due_date)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={task.status} 
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`text-xs font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-none transition cursor-pointer ${
              task.status === 'done' 
                ? 'bg-slate-50 border-neutral-border text-neutral-text-secondary' 
                : 'bg-primary-light border-primary/20 text-primary hover:bg-primary/10'
            }`}
          >
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <button 
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-neutral-text-muted hover:text-danger hover:bg-danger-light/30 transition border border-transparent hover:border-danger-light"
            title="Delete Task"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
