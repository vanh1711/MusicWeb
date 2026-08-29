import { create } from 'zustand';
import axios from 'axios';

// Attach token to axios headers if present
const storedToken = typeof window !== 'undefined' ? localStorage.getItem('vanhsound_token') : null;
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: 'login', // 'login' | 'register'

  openLoginModal: () => set({ isAuthModalOpen: true, authModalTab: 'login' }),
  openRegisterModal: () => set({ isAuthModalOpen: true, authModalTab: 'register' }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),

  // Initialize and check current user
  checkAuth: async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data && res.data.user) {
        set({ user: res.data.user, isAuthenticated: true });
      }
    } catch (err) {
      // Guest or token expired
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user } = res.data;

    localStorage.setItem('vanhsound_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    set({ token, user, isAuthenticated: true, isAuthModalOpen: false });
    return user;
  },

  // Register
  register: async (name, email, password, avatar_url = null) => {
    const res = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      avatar_url,
    });
    const { token, user } = res.data;

    localStorage.setItem('vanhsound_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    set({ token, user, isAuthenticated: true, isAuthModalOpen: false });
    return user;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('vanhsound_token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
