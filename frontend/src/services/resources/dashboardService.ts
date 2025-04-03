import axios from 'axios';

export const fetchUserProgress = async () => {
  try {
    const response = await axios.get('/api/V1/dashboard/progress/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};
