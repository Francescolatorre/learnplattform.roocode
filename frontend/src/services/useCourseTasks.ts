import { useQuery } from '@tanstack/react-query';

import { ILearningTask } from '@/types/Task';
import learningTaskService from 'src/services/resources/learningTaskService';

// Return the same type as what learningTaskService.getAll returns
export const useCourseTasks = (courseId: string) => {
  return useQuery<ILearningTask[], Error>({
    queryKey: ['courseTasks', courseId],
    queryFn: async () => learningTaskService.getAll({ course: courseId }),
  });
};
