import axios from 'axios';

import apiService from '../api/apiService';
import { LearningTask } from '../../types/common/entities';
import { TaskCreationData } from '../../types/common/apiTypes';

export const fetchTasksByCourse = async (
  courseId: string,
  includeSubtasks = false
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: LearningTask[];
}> => {
  return apiService.get(`tasks/course/${courseId}/`, { includeSubtasks });
};

export const createTask = async (
  taskData: TaskCreationData,
  notifyUsers = false
): Promise<LearningTask> => {
  const formData = new FormData();
  Object.entries(taskData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });
  formData.append('notifyUsers', String(notifyUsers));
  return apiService.post<LearningTask>('tasks/', formData);
};

export const updateTask = async (
  taskId: string,
  updatedData: Partial<LearningTask>
): Promise<LearningTask> => {
  return apiService.patch<LearningTask>(`tasks/${taskId}/`, updatedData);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await apiService.delete(`tasks/${taskId}/`);
};

export const fetchTaskSubmissions = async (
  taskId: string
): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> => {
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

  return { createTask: handleTaskCreation };
};
