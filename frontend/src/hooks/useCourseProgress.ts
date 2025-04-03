import { useQuery } from '@tanstack/react-query';
import { CourseProgressResponse } from '@/types/common/apiTypes';
import apiService from '@services/api/apiService';

export const useCourseProgress = (id: string) => {
  return useQuery({
    queryKey: ['courseProgress', id],
    queryFn: () =>
      apiService.get<CourseProgressResponse>(`/api/v1/courses/${id}/progress/`).then(res => res),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
