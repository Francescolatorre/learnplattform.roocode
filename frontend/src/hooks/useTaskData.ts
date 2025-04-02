import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api/apiService';

export const useTaskData = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiService.get(`/api/v1/tasks/${id}/`).then((res: any) => res.data),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
