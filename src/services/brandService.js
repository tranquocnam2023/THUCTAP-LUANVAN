import api from './api';

export const brandService = {
  getAll: () => api.get('/Brand'),
  
  getById: (id) => api.get(`/Brand/${id}`),
  
  create: (data) => api.post('/Brand', data),
  
  update: (id, data) => api.put(`/Brand/${id}`, data),
  
  delete: (id) => api.delete(`/Brand/${id}`),
};
