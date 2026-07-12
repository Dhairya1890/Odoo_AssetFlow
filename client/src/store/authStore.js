import { create } from 'zustand';
import apiClient from '../api/client';

const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getTokenPayload(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken: token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/signup', { name, email, password });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Signup failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
