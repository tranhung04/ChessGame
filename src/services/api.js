import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Single-flight refresh promise to prevent multiple concurrent refresh requests
let refreshPromise = null;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration with single-flight refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (
      error.response?.status === 401 && 
      (error.response?.data?.error?.code === 'TOKEN_EXPIRED' || 
       error.response?.data?.error?.code === 'INVALID_TOKEN') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Use single-flight pattern - if refresh already in progress, wait for it
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }

        const accessToken = await refreshPromise;
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        // Clear the refresh promise after completion
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

// Single-flight refresh function
async function refreshAccessToken() {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call refresh endpoint directly without using the intercepted api instance
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Save new tokens
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
    ]);

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

// Clear tokens helper
async function clearTokens() {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA)
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginWithGoogle: (data) => api.post('/auth/google', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/user/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};

// User API
export const userAPI = {
  getMe: () => api.get('/user/me'),
  updateMe: (data) => api.put('/user/me', data),
  getStats: () => api.get('/user/stats')
};

// Premium API
export const premiumAPI = {
  getPackages: () => api.get('/premium/packages'),
  subscribe: (packageId, paymentId) => api.post('/premium/subscribe', { packageId, paymentId }),
  checkStatus: () => api.get('/premium/status')
};

// Payment API
export const paymentAPI = {
  createPayment: (packageId, returnUrl) => api.post('/payment/vnpay/create', { packageId, returnUrl }),
  getPaymentStatus: (orderId) => api.get(`/payment/status/${orderId}`),
  getTransactions: (page = 1, limit = 10) => api.get('/payment/transactions', { params: { page, limit } })
};

// Game API
export const gameAPI = {
  startGame: (mode = 'normal') => api.post('/game/start', { mode }),
  submitGame: (sessionId, score, turnCount, duration, moves = null) => 
    api.post('/game/submit', { sessionId, score, turnCount, duration, moves }),
  endGame: (gameData) => 
    api.post('/game/submit', gameData),
  getHistory: (page = 1, limit = 10) => api.get('/game/history', { params: { page, limit } }),
  getLeaderboard: (limit = 100, period = 'all') => api.get('/game/leaderboard', { params: { limit, period } })
};

export default api;
