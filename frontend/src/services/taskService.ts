import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

export const fetchTasksByCourse = async (courseId: string) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/learning-tasks/by_course/`, {
      params: { course_id: courseId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Function to get a single task by ID
export const getTaskById = async (taskId: string) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/learning-tasks/${taskId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Updated function to update a task
export const updateTask = async (taskId: string, updatedDescription: string, updatedTitle?: string) => {
  try {
    const token = localStorage.getItem('access_token');

    // First, get the current task data
    const currentTask = await getTaskById(taskId);
    console.log('Current task data:', currentTask);

    // Update the description and title (if provided)
    const updatedTask = {
      ...currentTask,
      description: updatedDescription,
      ...(updatedTitle && { title: updatedTitle })
    };
    console.log('Sending updated task data:', updatedTask);

    const response = await axios.put(`${API_URL}/learning-tasks/${taskId}/`, updatedTask, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// New function to delete a task
export const deleteTask = async (taskId: string) => {
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`${API_URL}/learning-tasks/${taskId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
