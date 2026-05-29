import api from './api';

export const orderService = {
  getAll: () => api.get('/Order'),
  
  getById: (id) => api.get(`/Order/${id}`),
  
  updateStatus: (id, status) => api.patch(`/Order/${id}/status`, { status }),

  getMyOrders: () => api.get('/Order/my-orders'),

  checkout: (data) => api.post('/Order/checkout', data),
};
