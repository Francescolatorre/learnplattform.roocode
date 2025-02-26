import axios from 'axios';

const API_URL = '/api/v1/courses/';

export const fetchCourses = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const fetchCourseDetails = async (courseId: number) => {
  try {
    const response = await axios.get(`${API_URL}${courseId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course details for course ${courseId}:`, error);
    throw error;
  }
};
