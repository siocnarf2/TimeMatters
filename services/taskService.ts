import api from './api';

export type TaskStatus = 'pending' | 'completed' | 'rejected';
export type UserRole = 'player' | 'parent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  rewardMinutes: number;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  isRecurring: boolean;
  createdBy: UserRole;
  userId: string;
  familyId?: string;
}

// Get all tasks for the current user
export async function getTasks(): Promise<Task[]> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.get('/tasks');
    // return response.data;
    
    // Mock data for now
    return [
      {
        id: '1',
        title: 'Ranger sa chambre',
        description: 'Ranger tous les jouets et faire le lit',
        rewardMinutes: 30,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRecurring: false,
        createdBy: 'parent',
        userId: '1'
      },
      {
        id: '2',
        title: 'Faire ses devoirs',
        description: 'Terminer les exercices de mathématiques',
        rewardMinutes: 45,
        status: 'pending',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isRecurring: true,
        createdBy: 'parent',
        userId: '1'
      },
      {
        id: '3',
        title: 'Promener le chien',
        rewardMinutes: 20,
        status: 'completed',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        completedAt: new Date(Date.now() - 172800000).toISOString(),
        isRecurring: true,
        createdBy: 'player',
        userId: '1'
      }
    ];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Create a new task
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'userId'>): Promise<Task> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post('/tasks', task);
    // return response.data;
    
    // Mock response for now
    return {
      id: Date.now().toString(),
      ...task,
      createdAt: new Date().toISOString(),
      userId: '1'
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Complete a task
export async function completeTask(taskId: string): Promise<Task> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post(`/tasks/${taskId}/complete`);
    // return response.data;
    
    // Mock response for now
    return {
      id: taskId,
      title: 'Ranger sa chambre',
      description: 'Ranger tous les jouets et faire le lit',
      rewardMinutes: 30,
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date().toISOString(),
      isRecurring: false,
      createdBy: 'parent',
      userId: '1'
    };
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
}

// Reject a task
export async function rejectTask(taskId: string, reason?: string): Promise<Task> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post(`/tasks/${taskId}/reject`, { reason });
    // return response.data;
    
    // Mock response for now
    return {
      id: taskId,
      title: 'Ranger sa chambre',
      description: 'Ranger tous les jouets et faire le lit',
      rewardMinutes: 30,
      status: 'rejected',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRecurring: false,
      createdBy: 'parent',
      userId: '1'
    };
  } catch (error) {
    console.error('Error rejecting task:', error);
    throw error;
  }
}

// Update a task
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.put(`/tasks/${taskId}`, updates);
    // return response.data;
    
    // Mock response for now
    return {
      id: taskId,
      title: updates.title || 'Ranger sa chambre',
      description: updates.description || 'Ranger tous les jouets et faire le lit',
      rewardMinutes: updates.rewardMinutes || 30,
      status: updates.status || 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRecurring: updates.isRecurring !== undefined ? updates.isRecurring : false,
      createdBy: 'parent',
      userId: '1'
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  try {
    // In a real implementation, this would call your API
    // await api.delete(`/tasks/${taskId}`);
    console.log('Task deleted:', taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}