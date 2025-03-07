import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useScreenTimeStore } from '@/store/screenTimeStore';
import { Clock, Award, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { 
    screenTimeRemaining, 
    screenTimeEarned, 
    screenTimeUsed,
    screenTimeHistory,
    lastUpdated,
    fetchScreenTimeStats,
    isLoading,
    error
  } = useScreenTimeStore();
  
  // Fetch screen time stats on component mount
  useEffect(() => {
    fetchScreenTimeStats().catch(error => {
      console.error('Failed to fetch screen time stats:', error);
    });
  }, [fetchScreenTimeStats]);
  
  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return format(date, 'HH:mm', { locale: fr });
  };
  
  // Process data for timeline chart
  const processTimelineData = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const now = new Date();
    const currentHour = now.getHours();
    
    // Initialize data array with 0s from midnight to current hour
    const timelineData = new Array(currentHour + 1).fill(0);
    let runningTotal = 120; // Initial balance
    
    // Add inactivity rewards for overnight hours (midnight to 6am)
    for (let hour = 0; hour <= 6; hour++) {
      if (hour <= currentHour) {
        runningTotal += 15; // 15 minutes per hour of inactivity
        timelineData[hour] = runningTotal;
      }
    }
    
    // Process actual events
    screenTimeHistory.forEach(event => {
      const eventDate = new Date(event.timestamp);
      if (eventDate.setHours(0, 0, 0, 0) === today) {
        const hour = eventDate.getHours();
        if (hour <= currentHour) {
          if (event.type === 'earned') {
            runningTotal += event.minutes;
          } else {
            runningTotal -= event.minutes;
          }
          timelineData[hour] = runningTotal;
        }
      }
    });
    
    // Fill in gaps between events
    for (let i = 1; i <= currentHour; i++) {
      if (timelineData[i] === 0) {
        timelineData[i] = timelineData[i - 1];
      }
    }
    
    return {
      labels: Array.from({ length: currentHour + 1 }, (_, i) => `${i}h`),
      datasets: [
        {
          data: timelineData,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2,
        }
      ],
      legend: ['Temps disponible']
    };
  };
  
  // Group activities by date
  const groupActivitiesByDate = () => {
    const today = new Date().toLocaleDateString();
    return screenTimeHistory.filter(
      event => new Date(event.timestamp).toLocaleDateString() === today
    );
  };
  
  if (isLoading && screenTimeHistory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }
  
  const todayActivities = groupActivitiesByDate();
  const timelineData = processTimelineData();
  
  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.timeContainer}>
            <Clock size={24} color="#ffffff" />
            <Text style={styles.timeRemaining}>{formatTime(screenTimeRemaining)}</Text>
            <Text style={styles.timeLabel}>Temps d'écran restant</Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Évolution du temps disponible</Text>
        <LineChart
          data={timelineData}
          width={screenWidth - 32}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Award size={24} color="#6366f1" />
          <Text style={styles.statValue}>{formatTime(screenTimeEarned)}</Text>
          <Text style={styles.statLabel}>Temps gagné aujourd'hui</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock size={24} color="#ef4444" />
          <Text style={styles.statValue}>{formatTime(screenTimeUsed)}</Text>
          <Text style={styles.statLabel}>Temps utilisé aujourd'hui</Text>
        </View>
      </View>
      
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Activités récentes</Text>
        
        {todayActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune activité aujourd'hui</Text>
          </View>
        ) : (
          todayActivities.map((event, index) => (
            <View key={event.id} style={styles.activityItem}>
              <View style={styles.activityDot}>
                {event.type === 'earned' ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <Clock size={16} color="#ef4444" />
                )}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{event.source}</Text>
                <Text style={[
                  styles.activityTime,
                  event.type === 'used' && styles.negativeTime
                ]}>
                  {event.type === 'earned' ? '+' : '-'}{event.minutes} min
                </Text>
              </View>
              <Text style={styles.activityTimestamp}>
                {formatDate(new Date(event.timestamp))}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  gradientHeader: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeRemaining: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  negativeTime: {
    color: '#ef4444',
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
  },
});