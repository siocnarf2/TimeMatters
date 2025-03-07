import api from './api';
import { format } from 'date-fns';

export interface ScreenTimeEvent {
  id: string;
  type: 'earned' | 'used';
  minutes: number;
  source: string;
  timestamp: string;
  userId: string;
}

export interface ScreenTimeStats {
  remaining: number;
  earned: number;
  used: number;
  history: ScreenTimeEvent[];
  lastUpdated: string;
}

// Get current screen time stats
export async function getScreenTimeStats(): Promise<ScreenTimeStats> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.get('/screen-time/stats');
    // return response.data;
    
    // Mock data for now
    return {
      remaining: 120,
      earned: 45,
      used: 75,
      history: [
        {
          id: '1',
          type: 'earned',
          minutes: 15,
          source: 'Inactivité',
          timestamp: new Date().toISOString(),
          userId: '1'
        },
        {
          id: '2',
          type: 'used',
          minutes: 25,
          source: 'Instagram',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: '1'
        },
        {
          id: '3',
          type: 'earned',
          minutes: 30,
          source: 'Tâche: Ranger sa chambre',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userId: '1'
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching screen time stats:', error);
    throw error;
  }
}

// Add screen time (for completing tasks or inactivity)
export async function addScreenTime(minutes: number, source: string): Promise<ScreenTimeStats> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post('/screen-time/add', { minutes, source });
    // return response.data;
    
    // Mock response for now
    return {
      remaining: 135, // 120 + 15
      earned: 60, // 45 + 15
      used: 75,
      history: [
        {
          id: Date.now().toString(),
          type: 'earned',
          minutes,
          source,
          timestamp: new Date().toISOString(),
          userId: '1'
        },
        // ... previous history
      ],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding screen time:', error);
    throw error;
  }
}

// Use screen time (when using tracked apps)
export async function useScreenTime(minutes: number, source: string): Promise<ScreenTimeStats> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post('/screen-time/use', { minutes, source });
    // return response.data;
    
    // Mock response for now
    return {
      remaining: 95, // 120 - 25
      earned: 45,
      used: 100, // 75 + 25
      history: [
        {
          id: Date.now().toString(),
          type: 'used',
          minutes,
          source,
          timestamp: new Date().toISOString(),
          userId: '1'
        },
        // ... previous history
      ],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error using screen time:', error);
    throw error;
  }
}

// Get screen time history with filtering options
export async function getScreenTimeHistory(
  startDate?: Date,
  endDate?: Date,
  type?: 'earned' | 'used'
): Promise<ScreenTimeEvent[]> {
  try {
    // Format dates for API request
    const params: any = {};
    if (startDate) {
      params.startDate = format(startDate, 'yyyy-MM-dd');
    }
    if (endDate) {
      params.endDate = format(endDate, 'yyyy-MM-dd');
    }
    if (type) {
      params.type = type;
    }
    
    // In a real implementation, this would call your API
    // const response = await api.get('/screen-time/history', { params });
    // return response.data;
    
    // Mock data for now
    return [
      {
        id: '1',
        type: 'earned',
        minutes: 15,
        source: 'Inactivité',
        timestamp: new Date().toISOString(),
        userId: '1'
      },
      {
        id: '2',
        type: 'used',
        minutes: 25,
        source: 'Instagram',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: '1'
      },
      {
        id: '3',
        type: 'earned',
        minutes: 30,
        source: 'Tâche: Ranger sa chambre',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        userId: '1'
      },
      {
        id: '4',
        type: 'earned',
        minutes: 15,
        source: 'Inactivité',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        userId: '1'
      },
      {
        id: '5',
        type: 'used',
        minutes: 45,
        source: 'YouTube',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        userId: '1'
      }
    ].filter(event => {
      if (type && event.type !== type) return false;
      if (startDate && new Date(event.timestamp) < startDate) return false;
      if (endDate && new Date(event.timestamp) > endDate) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching screen time history:', error);
    throw error;
  }
}

// Reset screen time (admin/parent function)
export async function resetScreenTime(userId?: string): Promise<void> {
  try {
    // In a real implementation, this would call your API
    // await api.post('/screen-time/reset', { userId });
    console.log('Screen time reset for user:', userId || 'current user');
  } catch (error) {
    console.error('Error resetting screen time:', error);
    throw error;
  }
}