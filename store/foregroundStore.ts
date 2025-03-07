import { create } from 'zustand';
import { Platform } from 'react-native';
import { useScreenTimeStore } from './screenTimeStore';
import { useAppSettingsStore } from './settingsStore';

interface ForegroundState {
  isActive: boolean;
  lastActiveTimestamp: number;
  inactivityTimer: NodeJS.Timeout | null;
  
  // Actions
  startTracking: () => void;
  stopTracking: () => void;
  setActive: (isActive: boolean) => void;
  checkInactivity: () => void;
}

// Time in milliseconds to consider the app inactive (1 hour)
const INACTIVITY_THRESHOLD = 60 * 60 * 1000;

// Check interval in milliseconds (every minute)
const CHECK_INTERVAL = 60 * 1000;

export const useForegroundStore = create<ForegroundState>((set, get) => ({
  isActive: true,
  lastActiveTimestamp: Date.now(),
  inactivityTimer: null,
  
  startTracking: () => {
    try {
      // Don't track on web platform
      if (Platform.OS === 'web') return;
      
      set({ isActive: true, lastActiveTimestamp: Date.now() });
      
      // Clear any existing timer first to prevent duplicates
      const { inactivityTimer } = get();
      if (inactivityTimer) {
        clearInterval(inactivityTimer);
      }
      
      // Start the inactivity check timer
      const timer = setInterval(() => {
        try {
          get().checkInactivity();
        } catch (error) {
          console.error('Error checking inactivity:', error);
        }
      }, CHECK_INTERVAL);
      
      set({ inactivityTimer: timer });
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  },
  
  stopTracking: () => {
    try {
      const { inactivityTimer } = get();
      
      if (inactivityTimer) {
        clearInterval(inactivityTimer);
        set({ inactivityTimer: null });
      }
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  },
  
  setActive: (isActive) => {
    try {
      set({ 
        isActive,
        lastActiveTimestamp: isActive ? Date.now() : get().lastActiveTimestamp
      });
      
      // If becoming active after inactivity, check for rewards
      if (isActive) {
        get().checkInactivity();
      }
    } catch (error) {
      console.error('Error setting active state:', error);
    }
  },
  
  checkInactivity: () => {
    try {
      const { lastActiveTimestamp, isActive } = get();
      const now = Date.now();
      const inactiveTime = now - lastActiveTimestamp;
      
      // If the device has been inactive for more than the threshold
      if (!isActive && inactiveTime >= INACTIVITY_THRESHOLD) {
        // Calculate how many hours of inactivity
        const inactiveHours = Math.floor(inactiveTime / INACTIVITY_THRESHOLD);
        
        if (inactiveHours > 0) {
          // Get the inactivity reward rate from settings
          const settingsStore = useAppSettingsStore.getState();
          const inactivityRewardRate = settingsStore ? settingsStore.inactivityRewardRate : 15;
          
          // Calculate minutes to reward
          const minutesToReward = inactiveHours * inactivityRewardRate;
          
          // Add screen time
          const screenTimeStore = useScreenTimeStore.getState();
          if (screenTimeStore && screenTimeStore.addScreenTime) {
            screenTimeStore.addScreenTime(
              minutesToReward, 
              `Inactivité (${inactiveHours} heure${inactiveHours > 1 ? 's' : ''})`
            ).catch(error => {
              console.error('Failed to add screen time for inactivity:', error);
            });
          }
          
          // Update the last active timestamp to account for the rewarded time
          set({ lastActiveTimestamp: lastActiveTimestamp + (inactiveHours * INACTIVITY_THRESHOLD) });
        }
      }
    } catch (error) {
      console.error('Error checking inactivity:', error);
    }
  },
}));