import api from './api';

export const userService = {
  getAll: () => api.get('/User'),
  
  getById: (id) => api.get(`/User/${id}`),
  
  update: (id, data) => api.put(`/User/${id}`, data),
};
