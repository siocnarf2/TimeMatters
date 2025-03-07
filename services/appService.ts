import api from './api';

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  category: string;
  isTracked: boolean;
  packageName?: string; // For Android
  bundleId?: string; // For iOS
}

// Get all installed apps
export async function getInstalledApps(): Promise<AppInfo[]> {
  try {
    // In a real implementation, this would call your API or use device APIs
    // const response = await api.get('/apps/installed');
    // return response.data;
    
    // Mock data for now
    return [
      { id: '1', name: 'Instagram', icon: '📱', category: 'social', isTracked: true },
      { id: '2', name: 'YouTube', icon: '📺', category: 'video', isTracked: true },
      { id: '3', name: 'TikTok', icon: '🎵', category: 'social', isTracked: true },
      { id: '4', name: 'Snapchat', icon: '👻', category: 'social', isTracked: true },
      { id: '5', name: 'WhatsApp', icon: '💬', category: 'messaging', isTracked: false },
      { id: '6', name: 'Gmail', icon: '✉️', category: 'productivity', isTracked: false },
      { id: '7', name: 'Google Maps', icon: '🗺️', category: 'utility', isTracked: false },
      { id: '8', name: 'Spotify', icon: '🎧', category: 'music', isTracked: true },
      { id: '9', name: 'Netflix', icon: '🎬', category: 'video', isTracked: true },
      { id: '10', name: 'Calculator', icon: '🧮', category: 'utility', isTracked: false },
    ];
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    throw error;
  }
}

// Update app tracking status
export async function updateAppTracking(appId: string, isTracked: boolean): Promise<AppInfo> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.put(`/apps/${appId}/tracking`, { isTracked });
    // return response.data;
    
    // Find the app in our mock data
    const apps = await getInstalledApps();
    const app = apps.find(a => a.id === appId);
    
    if (!app) {
      throw new Error('App not found');
    }
    
    // Return updated app with original icon
    return {
      ...app,
      isTracked
    };
  } catch (error) {
    console.error('Error updating app tracking:', error);
    throw error;
  }
}

// Get app usage statistics
export async function getAppUsageStats(
  startDate?: Date,
  endDate?: Date
): Promise<{ appId: string; minutes: number; lastUsed: string }[]> {
  try {
    // In a real implementation, this would call your API
    // const params: any = {};
    // if (startDate) params.startDate = startDate.toISOString();
    // if (endDate) params.endDate = endDate.toISOString();
    // const response = await api.get('/apps/usage', { params });
    // return response.data;
    
    // Mock data for now
    return [
      { appId: '1', minutes: 120, lastUsed: new Date().toISOString() },
      { appId: '2', minutes: 90, lastUsed: new Date(Date.now() - 3600000).toISOString() },
      { appId: '3', minutes: 60, lastUsed: new Date(Date.now() - 7200000).toISOString() },
      { appId: '4', minutes: 45, lastUsed: new Date(Date.now() - 86400000).toISOString() },
      { appId: '8', minutes: 30, lastUsed: new Date(Date.now() - 172800000).toISOString() },
    ];
  } catch (error) {
    console.error('Error fetching app usage stats:', error);
    throw error;
  }
}