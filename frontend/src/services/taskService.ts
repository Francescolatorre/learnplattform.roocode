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
