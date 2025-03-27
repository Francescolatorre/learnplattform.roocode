import { useQuery } from 'react-query';
import { courseService } from '@services/apiService';

export const useCourse = (courseId: string) => {
  return useQuery(['course', courseId], async () => {
    const response = await courseService.get(`/courses/${courseId}/`);
    return response.data;
  });
};
