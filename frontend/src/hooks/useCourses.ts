import {useQuery} from '@tanstack/react-query';
import {courseService} from '@services/apiService';

export const useCourses = () => {
  return useQuery('courses', async () => {
    const response = await courseService.get('/courses/');
    return response.data;
  });
};
