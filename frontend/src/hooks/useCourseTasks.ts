import { useQuery } from '@tanstack/react-query';
import LearningTaskService from '@features/learningTasks/services/learningTaskService';

import { LearningTask } from '@/types/common/entities';

type ITask = LearningTask;

export const useCourseTasks = (courseId: string) => {
  return useQuery<ITask[], Error>({
    queryKey: ['courseTasks', courseId],
    queryFn: () => LearningTaskService.getAll({ course: courseId }),
  });
};
