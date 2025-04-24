import {useQuery} from '@tanstack/react-query';

import {apiService} from 'src/services/api/apiService';

export const useTaskData = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => apiService.get(`/api/v1/tasks/${id}/`),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
