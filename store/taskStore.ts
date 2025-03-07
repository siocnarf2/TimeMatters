import { create } from 'zustand';
import { useScreenTimeStore } from './screenTimeStore';
import * as taskService from '@/services/taskService';

export type TaskStatus = 'pending' | 'completed' | 'rejected';

export interface Task {
  id: string;
  title: string;
  description?: string;
  rewardMinutes: number;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  isRecurring: boolean;
  createdBy: 'player' | 'parent';
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completedAt' | 'createdAt'>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  rejectTask: (id: string) => Promise<void>;
  editTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [
    {
      id: '1',
      title: 'Ranger sa chambre',
      description: 'Ranger tous les jouets et faire le lit',
      rewardMinutes: 30,
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRecurring: false,
      createdBy: 'parent',
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
    },
  ],
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const tasks = await taskService.getTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: 'Failed to fetch tasks. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  addTask: async (task) => {
    set({ isLoading: true, error: null });
    
    try {
      const newTask = await taskService.createTask(task);
      
      set(state => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding task:', error);
      set({ 
        error: 'Failed to add task. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  completeTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Find the task
      const task = get().tasks.find(t => t.id === id);
      
      if (task && task.status === 'pending') {
        // Complete the task on the server
        const updatedTask = await taskService.completeTask(id);
        
        // Add screen time reward
        const screenTimeStore = useScreenTimeStore.getState();
        await screenTimeStore.addScreenTime(
          task.rewardMinutes,
          `Tâche: ${task.title}`
        );
        
        // Update the task status
        set(state => ({
          tasks: state.tasks.map(t => 
            t.id === id ? updatedTask : t
          ),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      set({ 
        error: 'Failed to complete task. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  rejectTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedTask = await taskService.rejectTask(id);
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? updatedTask : t
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error rejecting task:', error);
      set({ 
        error: 'Failed to reject task. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  editTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? updatedTask : t
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error editing task:', error);
      set({ 
        error: 'Failed to update task. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await taskService.deleteTask(id);
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ 
        error: 'Failed to delete task. Please try again.', 
        isLoading: false 
      });
    }
  },
}));