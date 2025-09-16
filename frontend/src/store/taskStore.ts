import { create } from 'zustand';

import { modernLearningTaskService } from '@/services/resources/modernLearningTaskService';
import { ILearningTask } from '@/types/Task';

interface TaskState {
  // Learning Tasks from API
  learningTasks: ILearningTask[];
  isLoading: boolean;
  error: string | null;

  // Local simple tasks (backward compatibility)
  localTasks: Array<{ id: string; title: string; completed: boolean }>;

  // Modern service-integrated actions
  fetchLearningTasks: (courseId?: string) => Promise<void>;
  createLearningTask: (task: Partial<ILearningTask>) => Promise<void>;
  updateLearningTask: (taskId: string, updates: Partial<ILearningTask>) => Promise<void>;
  deleteLearningTask: (taskId: string) => Promise<void>;

  // Legacy local actions (backward compatibility)
  addLocalTask: (task: { id: string; title: string; completed: boolean }) => void;
  removeLocalTask: (taskId: string) => void;
  toggleLocalTaskCompletion: (taskId: string) => void;

  // Utility actions
  clearError: () => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  // State
  learningTasks: [],
  isLoading: false,
  error: null,
  localTasks: [],

  // Modern service-integrated actions
  fetchLearningTasks: async (courseId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await modernLearningTaskService.getTasks(courseId);
      set({ learningTasks: tasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createLearningTask: async (task: Partial<ILearningTask>) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await modernLearningTaskService.createTask(task);
      set(state => ({
        learningTasks: [...state.learningTasks, newTask],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateLearningTask: async (taskId: string, updates: Partial<ILearningTask>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await modernLearningTaskService.updateTask(taskId, updates);
      set(state => ({
        learningTasks: state.learningTasks.map(task =>
          task.id === parseInt(taskId) ? updatedTask : task
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteLearningTask: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      await modernLearningTaskService.deleteTask(taskId);
      set(state => ({
        learningTasks: state.learningTasks.filter(task => task.id !== parseInt(taskId)),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Legacy local actions (backward compatibility)
  addLocalTask: (task) =>
    set(state => ({ localTasks: [...state.localTasks, task] })),

  removeLocalTask: (taskId: string) =>
    set(state => ({ localTasks: state.localTasks.filter(task => task.id !== taskId) })),

  toggleLocalTaskCompletion: (taskId: string) =>
    set(state => ({
      localTasks: state.localTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    })),

  // Utility actions
  clearError: () => set({ error: null }),
}));

export default useTaskStore;
