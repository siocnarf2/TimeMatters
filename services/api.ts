import axios from 'axios';
import Constants from 'expo-constants';
import { getAuthToken } from './auth';

// Base URL from environment variables
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.screentime-rewards.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token logic would go here
        // const newToken = await refreshToken();
        // originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        console.error('Failed to refresh token:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;