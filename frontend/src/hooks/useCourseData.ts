import { useQuery } from 'react-query';
import { apiService } from '@services/apiService';

export const useCourseData = (id: string) => {
  return useQuery(['course', id], () =>
    apiService.get(`/api/v1/courses/${id}/`).then(res => res.data)
  );
};
