import api from './api';

export const getAllTasks = (params) => {
  return api.get('/tasks', { params });
};

export const getTasksByProject = (projectId) => {
  return api.get(`/tasks/project/${projectId}`);
};

export const createTask = (data) => {
  return api.post('/tasks', data);
};

export const updateTask = (id, data) => {
  return api.put(`/tasks/${id}`, data);
};

export const deleteTask = (id) => {
  return api.delete(`/tasks/${id}`);
};

export default {
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};
