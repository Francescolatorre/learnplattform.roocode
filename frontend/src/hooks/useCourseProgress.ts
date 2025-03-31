import {useQuery} from '@tanstack/react-query';
import {apiService} from '@services/apiService';

export const useCourseProgress = (id: string) => {
  return useQuery(['courseProgress', id], () =>
    apiService.get(`/api/v1/courses/${id}/progress/`).then(res => res.data)
  );
};
