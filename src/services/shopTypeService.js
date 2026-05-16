import api from './api';

export const shopTypeService = {
  getAll: () => api.get('/ShopType'),
  
  getById: (id) => api.get(`/ShopType/${id}`),
  
  create: (data) => api.post('/ShopType', data),
  
  update: (id, data) => api.put(`/ShopType/${id}`, data),
  
  delete: (id) => api.delete(`/ShopType/${id}`),
};
