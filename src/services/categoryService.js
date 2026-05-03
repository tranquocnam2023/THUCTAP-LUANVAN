import api from './api';

export const categoryService = {
  getAll: () => api.get('/Category'),
  
  getById: (id) => api.get(`/Category/${id}`),
  
  create: (data) => api.post('/Category', data),
  
  update: (id, data) => api.put(`/Category/${id}`, data),
  
  delete: (id) => api.delete(`/Category/${id}`),
};
