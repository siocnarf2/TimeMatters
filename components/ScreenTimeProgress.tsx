import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenTimeStore } from '@/store/screenTimeStore';

interface ScreenTimeProgressProps {
  size?: 'small' | 'medium' | 'large';
}

export default function ScreenTimeProgress({ size = 'medium' }: ScreenTimeProgressProps) {
  const { screenTimeRemaining, screenTimeEarned, screenTimeUsed } = useScreenTimeStore();
  
  // Calculate total screen time (earned + initial)
  const totalScreenTime = screenTimeEarned + screenTimeUsed + screenTimeRemaining;
  
  // Calculate percentage of screen time remaining
  const remainingPercentage = (screenTimeRemaining / totalScreenTime) * 100;
  
  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };
  
  return (
    <View style={[styles.container, styles[`container${size}`]]}>
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${remainingPercentage}%` },
            remainingPercentage < 20 ? styles.lowProgress : null,
          ]} 
        />
      </View>
      
      <View style={styles.timeInfo}>
        <Text style={[styles.timeText, styles[`timeText${size}`]]}>
          {formatTime(screenTimeRemaining)}
        </Text>
        <Text style={styles.timeLabel}>restant</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containersmall: {
    maxWidth: 150,
  },
  containermedium: {
    maxWidth: 250,
  },
  containerlarge: {
    maxWidth: '100%',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  lowProgress: {
    backgroundColor: '#ef4444',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  timeText: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  timeTextsmall: {
    fontSize: 14,
  },
  timeTextmedium: {
    fontSize: 16,
  },
  timeTextlarge: {
    fontSize: 20,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
});