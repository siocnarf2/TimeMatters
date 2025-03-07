import { create } from 'zustand';
import * as familyService from '@/services/familyService';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UserRole = 'player' | 'parent';

// For web, use localStorage instead of SecureStore
const secureStorage = {
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
  }
};

// Parent code storage key
const PARENT_CODE_KEY = 'parent_code';

interface AppSettingsState {
  userRole: UserRole;
  familyCode: string;
  weeklyAllowance: number; // in minutes
  inactivityRewardRate: number; // minutes earned per hour of inactivity
  parentCode: string; // code to switch to parent mode
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  setFamilyCode: (code: string) => Promise<void>;
  setWeeklyAllowance: (minutes: number) => Promise<void>;
  setInactivityRewardRate: (minutes: number) => Promise<void>;
  setParentCode: (code: string) => Promise<void>;
  verifyParentCode: (code: string) => Promise<boolean>;
  fetchFamilySettings: () => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  userRole: 'player',
  familyCode: '',
  weeklyAllowance: 420, // 7 hours per week by default
  inactivityRewardRate: 15, // 15 minutes per hour of inactivity by default
  parentCode: '',
  isLoading: false,
  error: null,
  
  setUserRole: (role) => set({ userRole: role }),
  
  setFamilyCode: async (code) => {
    set({ isLoading: true, error: null });
    
    try {
      if (code.trim() === '') {
        set({ familyCode: '', isLoading: false });
        return;
      }
      
      // Join family with the provided code
      const family = await familyService.joinFamily(code);
      
      set({ 
        familyCode: family.code,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error setting family code:', error);
      set({ 
        error: 'Failed to join family. Please check the code and try again.', 
        isLoading: false 
      });
    }
  },
  
  setWeeklyAllowance: async (minutes) => {
    set({ isLoading: true, error: null });
    
    try {
      // Update family settings on the server
      await familyService.updateFamilySettings({ weeklyAllowance: minutes });
      
      set({ 
        weeklyAllowance: minutes, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error setting weekly allowance:', error);
      set({ 
        error: 'Failed to update weekly allowance. Please try again.', 
        isLoading: false,
        // Still update locally even if server update fails
        weeklyAllowance: minutes
      });
    }
  },
  
  setInactivityRewardRate: async (minutes) => {
    set({ isLoading: true, error: null });
    
    try {
      // Update family settings on the server
      await familyService.updateFamilySettings({ inactivityRewardRate: minutes });
      
      set({ 
        inactivityRewardRate: minutes, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error setting inactivity reward rate:', error);
      set({ 
        error: 'Failed to update inactivity reward rate. Please try again.', 
        isLoading: false,
        // Still update locally even if server update fails
        inactivityRewardRate: minutes
      });
    }
  },
  
  setParentCode: async (code) => {
    set({ isLoading: true, error: null });
    
    try {
      // Store the parent code securely
      await secureStorage.setItem(PARENT_CODE_KEY, code);
      
      set({
        parentCode: code,
        isLoading: false
      });
    } catch (error) {
      console.error('Error setting parent code:', error);
      set({
        error: 'Failed to set parent code. Please try again.',
        isLoading: false
      });
    }
  },
  
  verifyParentCode: async (code) => {
    try {
      const storedCode = await secureStorage.getItem(PARENT_CODE_KEY);
      return storedCode === code;
    } catch (error) {
      console.error('Error verifying parent code:', error);
      return false;
    }
  },
  
  fetchFamilySettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const family = await familyService.getFamily();
      const storedParentCode = await secureStorage.getItem(PARENT_CODE_KEY);
      
      if (family) {
        set({ 
          familyCode: family.code,
          isLoading: false 
        });
      }
      
      if (storedParentCode) {
        set({
          parentCode: storedParentCode
        });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error fetching family settings:', error);
      set({ 
        error: 'Failed to fetch family settings. Please try again.', 
        isLoading: false 
      });
    }
  },
}));