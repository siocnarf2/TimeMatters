import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from './api';
import { create } from 'zustand';

// For web, use localStorage instead of SecureStore
const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

// Auth token keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const PARENT_CODE_KEY = 'parent_code';

// Default parent code
const DEFAULT_PARENT_CODE = '0000';

// User types
export type UserRole = 'child' | 'parent';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  familyId?: string;
}

// Auth store interface
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyParentCode: (code: string) => Promise<boolean>;
}

// Create auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        role: 'child',
      };
      
      const mockToken = 'mock_jwt_token';
      const mockRefreshToken = 'mock_refresh_token';
      
      // Save tokens
      await tokenStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      await tokenStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      
      // Set default parent code if not already set
      const existingParentCode = await tokenStorage.getItem(PARENT_CODE_KEY);
      if (!existingParentCode) {
        await tokenStorage.setItem(PARENT_CODE_KEY, DEFAULT_PARENT_CODE);
      }
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: 'Failed to login. Please check your credentials.', 
        isLoading: false 
      });
    }
  },
  
  register: async (email, password, role) => {
    set({ isLoading: true, error: null });
    
    try {
      const mockUser: User = {
        id: '1',
        email,
        role,
      };
      
      const mockToken = 'mock_jwt_token';
      const mockRefreshToken = 'mock_refresh_token';
      
      await tokenStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      await tokenStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      await tokenStorage.setItem(PARENT_CODE_KEY, DEFAULT_PARENT_CODE);
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        error: 'Failed to register. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
      await tokenStorage.removeItem(REFRESH_TOKEN_KEY);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const token = await tokenStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return false;
      }
      
      const mockUser: User = {
        id: '1',
        email: 'user@example.com',
        role: 'child',
      };
      
      const existingParentCode = await tokenStorage.getItem(PARENT_CODE_KEY);
      if (!existingParentCode) {
        await tokenStorage.setItem(PARENT_CODE_KEY, DEFAULT_PARENT_CODE);
      }
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
      await tokenStorage.removeItem(REFRESH_TOKEN_KEY);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Session expired. Please login again.'
      });
      return false;
    }
  },
  
  updateUser: async (userData) => {
    set({ isLoading: true });
    
    try {
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { ...currentUser, ...userData },
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Update user error:', error);
      set({ 
        error: 'Failed to update user information.', 
        isLoading: false 
      });
    }
  },
  
  verifyParentCode: async (code) => {
    try {
      const storedCode = await tokenStorage.getItem(PARENT_CODE_KEY);
      return code === storedCode;
    } catch (error) {
      console.error('Parent code verification error:', error);
      return false;
    }
  },
}));

// Helper function to get the auth token
export async function getAuthToken(): Promise<string | null> {
  return tokenStorage.getItem(AUTH_TOKEN_KEY);
}