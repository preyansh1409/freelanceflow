import React, { useState, useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';
import api from '../../services/api';
import { FiPlay, FiSquare } from 'react-icons/fi';

const Timer = () => {
  const { isRunning, timerData, formatElapsed, start, stop } = useTimer();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects?status=active');
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        // Gracefully ignore database error
      }
    };
    if (!isRunning) {
      fetchProjects();
    }
  }, [isRunning]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    const project = projects.find(p => String(p.id) === String(selectedProjectId));
    const projectName = project ? project.name : 'Unknown Project';
    await start({ projectId: selectedProjectId, projectName, description });
    setDescription('');
  };

  if (isRunning && timerData) {
    return (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
            <span className="text-white font-mono font-bold tracking-wider text-base">{formatElapsed()}</span>
          </div>
          <button 
            type="button"
            onClick={stop}
            className="flex items-center justify-center bg-danger hover:bg-red-600 text-white rounded-md p-1.5 transition-colors"
            title="Stop Timer"
          >
            <FiSquare size={14} />
          </button>
        </div>
        <div className="text-[11px] font-semibold text-slate-200 truncate">{timerData.projectName}</div>
        {timerData.description && (
          <div className="text-[10px] text-slate-400 truncate italic">"{timerData.description}"</div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleStart} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2 text-xs">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Project</label>
        {projects.length === 0 ? (
          <div className="text-slate-500 italic py-1">No active projects found</div>
        ) : (
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 focus:outline-none focus:border-primary text-xs"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">What are you working on?</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description..."
          className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 focus:outline-none focus:border-primary text-xs"
        />
      </div>
      <button 
        type="submit"
        disabled={projects.length === 0 || !selectedProjectId}
        className="flex items-center justify-center gap-1.5 w-full bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded py-1.5 transition-colors mt-1"
      >
        <FiPlay size={10} />
        Start Timer
      </button>
    </form>
  );
};

export default Timer;
