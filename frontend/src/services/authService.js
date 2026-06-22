import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

export const getMe = () => {
  return api.get('/auth/me');
};

export const updateProfile = (name, email) => {
  return api.put('/auth/profile', { name, email });
};

export const updatePassword = (currentPassword, newPassword) => {
  return api.put('/auth/password', { currentPassword, newPassword });
};

export const deleteAccount = () => {
  return api.delete('/auth/account');
};

export default {
  login,
  register,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
};
