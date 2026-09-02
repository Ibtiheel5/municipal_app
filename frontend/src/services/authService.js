import api from './api';

const AuthService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default AuthService;