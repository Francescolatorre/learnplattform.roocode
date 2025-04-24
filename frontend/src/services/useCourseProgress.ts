import {useQuery} from '@tanstack/react-query';

import {apiService} from 'src/services/api/apiService';

export const useCourseProgress = (id: string) => {
  return useQuery({
    queryKey: ['courseProgress', id],
    queryFn: async () => apiService.get(`/api/v1/courses/${id}/progress/`),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
