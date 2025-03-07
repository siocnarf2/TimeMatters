import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';
import { useScreenTimeStore } from '@/store/screenTimeStore';
import { format, startOfDay, eachHourOfInterval, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { screenTimeHistory, isLoading, error } = useScreenTimeStore();
  const [timelineData, setTimelineData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      }
    ],
    legend: ['Temps disponible']
  });

  useEffect(() => {
    processTimelineData();
  }, [screenTimeHistory]);

  const processTimelineData = () => {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const currentHour = now.getHours();
    
    // Generate hours from midnight to current hour
    const hours = eachHourOfInterval({
      start: startOfToday,
      end: addHours(startOfToday, currentHour)
    });

    // Initialize data array with base time (120 minutes)
    let runningTotal = 120;
    const timeData = new Array(currentHour + 1).fill(0);
    timeData[0] = runningTotal;

    // Add inactivity rewards for overnight hours (midnight to 6am)
    for (let hour = 1; hour <= 6 && hour <= currentHour; hour++) {
      runningTotal += 15; // 15 minutes per hour of inactivity
      timeData[hour] = runningTotal;
    }

    // Process actual events
    screenTimeHistory.forEach(event => {
      const eventDate = new Date(event.timestamp);
      if (format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        const hour = eventDate.getHours();
        if (hour <= currentHour) {
          if (event.type === 'earned') {
            runningTotal += event.minutes;
          } else {
            runningTotal -= event.minutes;
          }
          timeData[hour] = runningTotal;
        }
      }
    });

    // Fill gaps between events
    for (let i = 1; i <= currentHour; i++) {
      if (timeData[i] === 0) {
        timeData[i] = timeData[i - 1];
      }
    }

    setTimelineData({
      labels: hours.map(hour => format(hour, 'HH:00', { locale: fr })),
      datasets: [
        {
          data: timeData,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2,
        }
      ],
      legend: ['Temps disponible']
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Évolution du temps disponible</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={timelineData}
            width={screenWidth - 32}
            height={220}
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activités du jour</Text>
        {screenTimeHistory
          .filter(event => {
            const eventDate = new Date(event.timestamp);
            return format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          })
          .map((event, index) => (
            <View key={event.id} style={styles.activityItem}>
              <View style={styles.activityTime}>
                <Text style={styles.timeText}>
                  {format(new Date(event.timestamp), 'HH:mm')}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{event.source}</Text>
                <Text style={[
                  styles.activityMinutes,
                  event.type === 'earned' ? styles.earnedTime : styles.usedTime
                ]}>
                  {event.type === 'earned' ? '+' : '-'}{event.minutes} min
                </Text>
              </View>
            </View>
          ))}
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
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityTime: {
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  activityMinutes: {
    fontSize: 14,
    fontWeight: '600',
  },
  earnedTime: {
    color: '#10b981',
  },
  usedTime: {
    color: '#ef4444',
  },
});