import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/services/auth';
import { Clock, Plus, CircleCheck as CheckCircle, Circle as XCircle, CreditCard as Edit3 } from 'lucide-react-native';

export default function TasksScreen() {
  const { 
    tasks, 
    addTask, 
    completeTask, 
    rejectTask,
    fetchTasks,
    isLoading,
    error
  } = useTaskStore();
  
  const { user } = useAuthStore();
  
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('30');
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks().catch(error => {
      console.error('Failed to fetch tasks:', error);
    });
  }, [fetchTasks]);
  
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return;
    
    try {
      await addTask({
        title: newTaskTitle,
        description: newTaskDescription,
        rewardMinutes: parseInt(newTaskReward, 10) || 30,
        status: 'pending',
        isRecurring,
        createdBy: user?.role || 'player',
      });
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskReward('30');
      setIsRecurring(false);
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };
  
  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement des tâches...</Text>
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
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes tâches</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowNewTaskForm(!showNewTaskForm)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      {showNewTaskForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Proposer une nouvelle tâche</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Titre</Text>
            <TextInput
              style={styles.input}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Ex: Ranger ma chambre"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (optionnelle)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              placeholder="Détails de la tâche à accomplir"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Récompense (minutes)</Text>
            <TextInput
              style={styles.input}
              value={newTaskReward}
              onChangeText={setNewTaskReward}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Tâche récurrente</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#e2e8f0', true: '#a5b4fc' }}
              thumbColor={isRecurring ? '#6366f1' : '#f4f4f5'}
            />
          </View>
          
          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowNewTaskForm(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddTask}
            >
              <Text style={styles.submitButtonText}>Proposer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>En attente de validation</Text>
        
        {pendingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune tâche en attente</Text>
          </View>
        ) : (
          pendingTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskReward}>
                  <Clock size={16} color="#6366f1" />
                  <Text style={styles.taskRewardText}>+{task.rewardMinutes} min</Text>
                </View>
              </View>
              
              {task.description ? (
                <Text style={styles.taskDescription}>{task.description}</Text>
              ) : null}
              
              {task.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringBadgeText}>Récurrente</Text>
                </View>
              )}
              
              <View style={styles.taskMeta}>
                <Text style={styles.taskMetaText}>
                  Proposée par: {task.createdBy === 'player' ? 'Moi' : 'Parent'}
                </Text>
                <Text style={styles.taskMetaText}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              {task.createdBy !== 'player' && (
                <View style={styles.taskActions}>
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => completeTask(task.id)}
                  >
                    <CheckCircle size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Marquer comme terminée</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {user?.role === 'parent' && task.createdBy === 'player' && (
                <View style={styles.parentActions}>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => completeTask(task.id)}
                  >
                    <CheckCircle size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Approuver</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => rejectTask(task.id)}
                  >
                    <XCircle size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tâches complétées</Text>
        
        {completedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune tâche complétée</Text>
          </View>
        ) : (
          completedTasks.map(task => (
            <View key={task.id} style={[styles.taskCard, styles.completedTaskCard]}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskReward}>
                  <Clock size={16} color="#10b981" />
                  <Text style={[styles.taskRewardText, styles.completedRewardText]}>
                    +{task.rewardMinutes} min
                  </Text>
                </View>
              </View>
              
              {task.description ? (
                <Text style={styles.taskDescription}>{task.description}</Text>
              ) : null}
              
              <View style={styles.completedBadge}>
                <CheckCircle size={14} color="#ffffff" />
                <Text style={styles.completedBadgeText}>Complétée</Text>
              </View>
              
              <View style={styles.taskMeta}>
                <Text style={styles.taskMetaText}>
                  Validée le: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </Text>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  taskCard: {
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
  completedTaskCard: {
    opacity: 0.8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  taskRewardText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedRewardText: {
    color: '#10b981',
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 12,
  },
  recurringBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  recurringBadgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  taskActions: {
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  parentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  approveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});