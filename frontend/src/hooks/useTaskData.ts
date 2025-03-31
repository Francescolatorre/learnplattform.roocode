import {useQuery} from '@tanstack/react-query';
import {apiService} from '@services/apiService';

export const useTaskData = (id: string) => {
  return useQuery(['task', id], () => apiService.get(`/api/v1/tasks/${id}/`).then(res => res.data));
};
