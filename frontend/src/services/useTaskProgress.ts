import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiService} from './api/apiService';
import type {ITaskProgress, IQuizHistory, ITaskProgressUpdateData} from '@/types/task';

/**
 * Fetches progress for a specific task (including quiz attempts if applicable).
 */
export const useTaskProgress = (taskId: string | number) => {
    return useQuery<ITaskProgress>({
        queryKey: ['taskProgress', taskId],
        queryFn: async () => apiService.get<ITaskProgress>(`/api/v1/tasks/${taskId}/progress/`),
        enabled: !!taskId,
        refetchOnWindowFocus: false,
    });
};

/**
 * Fetches quiz attempt history for a specific quiz task.
 */
export const useQuizHistory = (quizId: string | number) => {
    return useQuery<IQuizHistory[]>({
        queryKey: ['quizHistory', quizId],
        queryFn: async () => apiService.get<IQuizHistory[]>(`/api/v1/quizzes/${quizId}/history/`),
        enabled: !!quizId,
        refetchOnWindowFocus: false,
    });
};

/**
 * Submits or updates progress for a specific task (e.g., submitting a quiz attempt).
 */
export const useUpdateTaskProgress = (taskId: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ITaskProgressUpdateData) =>
            apiService.patch<ITaskProgress>(`/api/v1/tasks/${taskId}/progress/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['taskProgress', taskId]});
        },
    });
};
