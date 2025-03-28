import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchCourses = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/courses/`, {params});
  return response.data;
};

// Export other course-related services if needed
export default {
  fetchCourses,
};
