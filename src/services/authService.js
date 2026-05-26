import api from './api';

export const authService = {
  login: (credentials) => api.post('/Auth/login', credentials),
  
  register: (userData) => api.post('/Auth/register', userData),
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  }
};
