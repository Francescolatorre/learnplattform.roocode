import axios from 'axios';

export const fetchLearningTasks = async () => {
  const response = await axios.get('/api/learning-tasks/');
  return response.data;
};
