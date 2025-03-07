import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useForegroundStore } from '@/store/foregroundStore';
import { useScreenTimeStore } from '@/store/screenTimeStore';
import { useAuthStore } from '@/services/auth';

// Background task name
const BACKGROUND_SCREEN_TIME_TASK = 'background-screen-time-task';

// Define the background task
TaskManager.defineTask(BACKGROUND_SCREEN_TIME_TASK, async () => {
  try {
    // Get the current timestamp
    const now = Date.now();
    
    // Update the last active timestamp in the store
    // This would be implemented differently on a real device with actual screen time tracking
    if (Platform.OS !== 'web') {
      // In a real implementation, we would check if the device is being used
      // and update the screen time accordingly
      console.log('Background task executed at:', new Date(now).toISOString());
    }
    
    // Return success to ensure the task continues to run
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
async function registerBackgroundTask() {
  if (Platform.OS === 'web') {
    console.log('Background tasks are not supported on web');
    return;
  }
  
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SCREEN_TIME_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered');
  } catch (error) {
    console.error('Background task registration failed:', error);
  }
}

export default function RootLayout() {
  const { startTracking } = useForegroundStore();
  const { fetchScreenTimeStats } = useScreenTimeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    checkAuth().catch(error => {
      console.error('Auth check failed:', error);
    });
    
    // Start tracking screen time when the app is in the foreground
    startTracking();
    
    // Fetch initial screen time stats
    fetchScreenTimeStats().catch(error => {
      console.error('Failed to fetch screen time stats:', error);
    });
    
    // Register the background task with proper error handling
    if (Platform.OS !== 'web') {
      registerBackgroundTask().catch(error => {
        console.error('Failed to register background task:', error);
      });
    }
    
    // Handle framework ready event for web
    if (typeof window !== 'undefined' && window.frameworkReady) {
      try {
        window.frameworkReady();
      } catch (error) {
        console.error('Error in frameworkReady:', error);
      }
    }
    
    return () => {
      // Clean up if needed
    };
  }, [startTracking, fetchScreenTimeStats, checkAuth]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}