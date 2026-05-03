import api from './api';

export const dashboardService = {
  getStats: () => api.get('/Dashboard/Stats'),
  
  getRevenue: () => api.get('/Dashboard/Revenue'),
  
  getRecentOrders: () => api.get('/Order/Recent'),
  
  getBirthdays: () => api.get('/User/Birthdays'),
};
