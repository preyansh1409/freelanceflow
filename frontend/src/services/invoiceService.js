import api from './api';

export const getAllInvoices = () => {
  return api.get('/invoices');
};

export const getInvoiceById = (id) => {
  return api.get(`/invoices/${id}`);
};

export const createInvoice = (data) => {
  return api.post('/invoices', data);
};

export const updateInvoiceStatus = (id, status) => {
  return api.patch(`/invoices/${id}/status`, { status });
};

export const deleteInvoice = (id) => {
  return api.delete(`/invoices/${id}`);
};

export default {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
