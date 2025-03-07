import { create } from 'zustand';
import { Platform } from 'react-native';
import * as screenTimeService from '@/services/screenTimeService';

interface ScreenTimeEvent {
  id: string;
  type: 'earned' | 'used';
  minutes: number;
  source: string;
  timestamp: string;
}

interface ScreenTimeState {
  screenTimeRemaining: number;
  screenTimeEarned: number;
  screenTimeUsed: number;
  screenTimeHistory: ScreenTimeEvent[];
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchScreenTimeStats: () => Promise<void>;
  addScreenTime: (minutes: number, source: string) => Promise<void>;
  useScreenTime: (minutes: number, source: string) => Promise<void>;
  resetScreenTime: () => Promise<void>;
}

export const useScreenTimeStore = create<ScreenTimeState>((set, get) => ({
  screenTimeRemaining: 120, // Initial screen time in minutes
  screenTimeEarned: 0,
  screenTimeUsed: 0,
  screenTimeHistory: [],
  lastUpdated: Date.now(),
  isLoading: false,
  error: null,
  
  fetchScreenTimeStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const stats = await screenTimeService.getScreenTimeStats();
      
      set({
        screenTimeRemaining: stats.remaining,
        screenTimeEarned: stats.earned,
        screenTimeUsed: stats.used,
        screenTimeHistory: stats.history,
        lastUpdated: new Date(stats.lastUpdated).getTime(),
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching screen time stats:', error);
      set({ 
        error: 'Failed to fetch screen time statistics.', 
        isLoading: false 
      });
    }
  },
  
  addScreenTime: async (minutes, source) => {
    set({ isLoading: true, error: null });
    
    try {
      const stats = await screenTimeService.addScreenTime(minutes, source);
      
      set({
        screenTimeRemaining: stats.remaining,
        screenTimeEarned: stats.earned,
        screenTimeUsed: stats.used,
        screenTimeHistory: stats.history,
        lastUpdated: new Date(stats.lastUpdated).getTime(),
        isLoading: false
      });
    } catch (error) {
      console.error('Error adding screen time:', error);
      
      // Fallback to local update if API fails
      const newEvent: ScreenTimeEvent = {
        id: Date.now().toString(),
        type: 'earned',
        minutes,
        source,
        timestamp: new Date().toISOString(),
      };
      
      set(state => ({
        screenTimeRemaining: state.screenTimeRemaining + minutes,
        screenTimeEarned: state.screenTimeEarned + minutes,
        screenTimeHistory: [newEvent, ...state.screenTimeHistory],
        lastUpdated: Date.now(),
        isLoading: false,
        error: 'Failed to sync with server. Changes saved locally.'
      }));
    }
  },
  
  useScreenTime: async (minutes, source) => {
    set({ isLoading: true, error: null });
    
    try {
      const stats = await screenTimeService.useScreenTime(minutes, source);
      
      set({
        screenTimeRemaining: stats.remaining,
        screenTimeEarned: stats.earned,
        screenTimeUsed: stats.used,
        screenTimeHistory: stats.history,
        lastUpdated: new Date(stats.lastUpdated).getTime(),
        isLoading: false
      });
    } catch (error) {
      console.error('Error using screen time:', error);
      
      // Fallback to local update if API fails
      const actualMinutesToUse = Math.min(minutes, get().screenTimeRemaining);
      
      const newEvent: ScreenTimeEvent = {
        id: Date.now().toString(),
        type: 'used',
        minutes: actualMinutesToUse,
        source,
        timestamp: new Date().toISOString(),
      };
      
      set(state => ({
        screenTimeRemaining: state.screenTimeRemaining - actualMinutesToUse,
        screenTimeUsed: state.screenTimeUsed + actualMinutesToUse,
        screenTimeHistory: [newEvent, ...state.screenTimeHistory],
        lastUpdated: Date.now(),
        isLoading: false,
        error: 'Failed to sync with server. Changes saved locally.'
      }));
    }
  },
  
  resetScreenTime: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await screenTimeService.resetScreenTime();
      
      set({
        screenTimeRemaining: 120,
        screenTimeEarned: 0,
        screenTimeUsed: 0,
        screenTimeHistory: [],
        lastUpdated: Date.now(),
        isLoading: false
      });
    } catch (error) {
      console.error('Error resetting screen time:', error);
      set({ 
        error: 'Failed to reset screen time.', 
        isLoading: false 
      });
    }
  },
}));