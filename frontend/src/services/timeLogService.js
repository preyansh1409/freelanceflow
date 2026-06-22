import api from './api';

export const getAllLogs = (params) => {
  return api.get('/timelogs', { params });
};

export const getRunningTimer = () => {
  return api.get('/timelogs/running');
};

export const getLogsByProject = (projectId) => {
  return api.get(`/timelogs/project/${projectId}`);
};

export const startTimer = (data) => {
  return api.post('/timelogs/start', data);
};

export const stopTimer = () => {
  return api.post('/timelogs/stop');
};

export const addManualEntry = (data) => {
  return api.post('/timelogs/manual', data);
};

export const deleteLog = (id) => {
  return api.delete(`/timelogs/${id}`);
};

export default {
  getAllLogs,
  getRunningTimer,
  getLogsByProject,
  startTimer,
  stopTimer,
  addManualEntry,
  deleteLog,
};
