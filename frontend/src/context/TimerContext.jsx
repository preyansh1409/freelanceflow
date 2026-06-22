import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [timerData, setTimerData] = useState(() => {
    const stored = localStorage.getItem('ff_timer');
    return stored ? JSON.parse(stored) : null;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  const isRunning = Boolean(timerData);

  // Synchronize timer with backend on mount
  useEffect(() => {
    const syncTimer = async () => {
      try {
        const token = localStorage.getItem('ff_token');
        if (!token) return;
        const { data } = await api.get('/timelogs/running');
        if (data) {
          const payload = {
            logId: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            startTime: data.start_time,
            description: data.description,
          };
          localStorage.setItem('ff_timer', JSON.stringify(payload));
          setTimerData(payload);
        } else {
          localStorage.removeItem('ff_timer');
          setTimerData(null);
        }
      } catch (err) {
        // Gracefully ignore error if database is offline or not configured yet
      }
    };
    syncTimer();
  }, []);

  // Tick every second
  useEffect(() => {
    if (timerData) {
      const startMs = new Date(timerData.startTime).getTime();
      const tick = () => {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerData]);

  const start = async ({ projectId, projectName, taskId, description }) => {
    try {
      const { data } = await api.post('/timelogs/start', { project_id: projectId, task_id: taskId, description });
      const payload = {
        logId: data.id,
        projectId,
        projectName,
        startTime: data.start_time,
        description,
      };
      localStorage.setItem('ff_timer', JSON.stringify(payload));
      setTimerData(payload);
      toast.success(`Timer started — ${projectName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start timer');
    }
  };

  const stop = async () => {
    try {
      const { data } = await api.post('/timelogs/stop');
      localStorage.removeItem('ff_timer');
      setTimerData(null);
      const mins = data.duration_minutes || 0;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      toast.success(`Timer stopped — ${h}h ${m}m logged`);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not stop timer');
    }
  };

  const formatElapsed = () => {
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <TimerContext.Provider value={{ isRunning, timerData, elapsedSeconds, formatElapsed, start, stop }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
export default TimerContext;
