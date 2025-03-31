import axios from 'axios';
import {z} from 'zod';

import apiService from '../api/apiService';
import {Task, TaskCreationData} from '../../types/common/apiTypes';

// Enhanced Type Definitions with Validation
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  course: z.number(),
  is_published: z.boolean(),
  max_submissions: z.number().optional(),
  deadline: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const TaskCreationSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  attachment: z.instanceof(File).optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskCreationData = z.infer<typeof TaskCreationSchema>;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`; // Ensure correct API version

function handleError(error: unknown, context: string) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      console.error(`${context}: Unauthorized access. Please log in again.`);
      window.dispatchEvent(new Event('unauthorized'));
    } else if (error.response?.status === 403) {
      console.error(`${context}: Forbidden. You do not have permission to perform this action.`);
    } else if (error.response?.status === 404) {
      console.error(`${context}: Resource not found.`);
    } else if (error.response?.status === 500) {
      console.error(`${context}: Internal server error. Please try again later.`);
    } else {
      console.error(`${context}:`, error.response?.data || error.message);
    }
  } else {
    console.error(`${context}:`, error);
  }
}

export const fetchTasksByCourse = async (
  courseId: string,
  includeSubtasks = false
): Promise<{count: number; next: string | null; previous: string | null; results: Task[]}> => {
  return apiService.get(`tasks/course/${courseId}/`, {includeSubtasks});
};

export const createTask = async (
  taskData: TaskCreationData,
  notifyUsers = false
): Promise<Task> => {
  const formData = new FormData();
  Object.entries(taskData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });
  return apiService.post<Task>('tasks/', formData, {notifyUsers});
};

export const updateTask = async (taskId: string, updatedData: Partial<Task>): Promise<Task> => {
  return apiService.patch<Task>(`tasks/${taskId}/`, updatedData);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await apiService.delete(`tasks/${taskId}/`);
};

export const fetchTaskSubmissions = async (
  taskId: string
): Promise<{count: number; next: string | null; previous: string | null; results: any[]}> => {
  return apiService.get(`tasks/${taskId}/submissions/`);
};

export const fetchTaskAnalytics = async (taskId: string): Promise<any> => {
  return apiService.get(`tasks/${taskId}/analytics/`);
};

// React Hook for task creation (for backward compatibility)
export const useTaskCreation = () => {
  const handleTaskCreation = async (taskData: Omit<TaskCreationData, 'course'>) => {
    // TODO: Replace with actual course selection logic
    const courseId = 1;

    return createTask({
      ...taskData,
      course: courseId,
      is_published: taskData.is_published || false,
    });
  };

  return {createTask: handleTaskCreation};
};
