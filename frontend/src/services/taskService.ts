import axios from 'axios';
import { z } from 'zod';
import { useAuth, refreshAccessToken } from '../features/auth/AuthContext'; // Correct import

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
  updated_at: z.string().optional()
});

const TaskCreationSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  attachment: z.instanceof(File).optional()
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskCreationData = z.infer<typeof TaskCreationSchema>;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

async function getAuthHeaders() {
  try {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // Attempt to refresh the token if it's missing
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const response = await refreshAccessToken(refreshToken);
        accessToken = response.access;
        localStorage.setItem('access_token', accessToken);
      } else {
        throw new Error('No access or refresh token found. Please log in again.');
      }
    }

    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw error;
  }
}

function handleError(error: unknown, context: string) {
  console.error(`${context}:`, error);
  // TODO: Implement more robust error handling
  // Potential integration with global error tracking system
}

export async function fetchTasksByCourse(courseId: string): Promise<Task[]> {
  try {
    const headers = await getAuthHeaders(); // Ensure headers are fetched asynchronously
    const response = await axios.get<Task[]>(`${API_URL}/tasks/course/${courseId}/`, {
      headers,
    });
    const tasks = response.data.map((task: any) => ({
      ...task,
      id: String(task.id), // Ensure id is a string
    }));
    return tasks.map(task => TaskSchema.parse(task));
  } catch (error) {
    handleError(error, 'Failed to fetch tasks for course');
    return [];
  }
}

export async function createTask(taskData: TaskCreationData): Promise<Task> {
  const formData = new FormData();
  Object.entries(taskData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  try {
    const response = await axios.post<Task>(`${API_URL}/tasks/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return TaskSchema.parse(response.data);
  } catch (error) {
    handleError(error, 'Task creation failed');
    throw error;
  }
}

export async function updateTask(
  taskId: string,
  description: string,
  title: string
): Promise<Task> {
  try {
    const response = await axios.patch<Task>(`${API_URL}/tasks/${taskId}/`,
      { description, title },
      { headers: getAuthHeaders() }
    );
    return TaskSchema.parse(response.data);
  } catch (error) {
    handleError(error, 'Task update failed');
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/tasks/${taskId}/`, {
      headers: getAuthHeaders()
    });
  } catch (error) {
    handleError(error, 'Error deleting task');
    throw error;
  }
}

// React Hook for task creation (for backward compatibility)
export const useTaskCreation = () => {
  const { user } = useAuth();

  const handleTaskCreation = async (taskData: Omit<TaskCreationData, 'course'>) => {
    if (!user) {
      throw new Error('User must be logged in to create a task');
    }

    // TODO: Replace with actual course selection logic
    const courseId = 1;

    return createTask({
      ...taskData,
      course: courseId,
      is_published: taskData.is_published || false
    });
  };

  return { createTask: handleTaskCreation };
};
