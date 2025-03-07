import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/store/taskStore';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, CreditCard as Edit3 } from 'lucide-react-native';

interface TaskItemProps {
  task: Task;
  onComplete?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
  showActions?: boolean;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onReject, 
  onEdit,
  showActions = true,
}: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  
  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.reward}>
          <Clock size={16} color={isCompleted ? '#10b981' : '#6366f1'} />
          <Text 
            style={[
              styles.rewardText, 
              isCompleted && styles.completedRewardText
            ]}
          >
            +{task.rewardMinutes} min
          </Text>
        </View>
      </View>
      
      {task.description ? (
        <Text style={styles.description}>{task.description}</Text>
      ) : null}
      
      <View style={styles.metaContainer}>
        {task.isRecurring && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Récurrente</Text>
          </View>
        )}
        
        {isCompleted && (
          <View style={styles.completedBadge}>
            <CheckCircle size={12} color="#ffffff" />
            <Text style={styles.completedBadgeText}>Complétée</Text>
          </View>
        )}
        
        <Text style={styles.createdBy}>
          Par: {task.createdBy === 'player' ? 'Moi' : 'Parent'}
        </Text>
      </View>
      
      {showActions && !isCompleted && (
        <View style={styles.actions}>
          {onComplete && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => onComplete(task.id)}
            >
              <CheckCircle size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Terminer</Text>
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEdit(task.id)}
            >
              <Edit3 size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
          )}
          
          {onReject && (
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => onReject(task.id)}
            >
              <XCircle size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Refuser</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rewardText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedRewardText: {
    color: '#10b981',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  createdBy: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});