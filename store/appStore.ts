import { create } from 'zustand';
import * as appService from '@/services/appService';

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  category: string;
  isTracked: boolean;
}

interface AppState {
  apps: AppInfo[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApps: () => Promise<void>;
  toggleAppTracking: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [],
  isLoading: false,
  error: null,
  
  fetchApps: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const apps = await appService.getInstalledApps();
      set({ apps, isLoading: false });
    } catch (error) {
      console.error('Error fetching apps:', error);
      set({ 
        error: 'Failed to fetch installed apps. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  toggleAppTracking: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const app = get().apps.find(a => a.id === id);
      
      if (app) {
        const updatedApp = await appService.updateAppTracking(id, !app.isTracked);
        
        set(state => ({
          apps: state.apps.map(a => 
            a.id === id ? updatedApp : a
          ),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error toggling app tracking:', error);
      
      // Fallback to local update if API fails
      set(state => ({
        apps: state.apps.map(a => 
          a.id === id ? { ...a, isTracked: !a.isTracked } : a
        ),
        isLoading: false,
        error: 'Failed to sync with server. Changes saved locally.'
      }));
    }
  },
}));