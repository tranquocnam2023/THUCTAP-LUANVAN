import api from './api';

export const promotionService = {
  getAll: () => api.get('/Promotion'),
  getMyUsages: () => api.get('/PromotionUsage/my-usages'),
};
