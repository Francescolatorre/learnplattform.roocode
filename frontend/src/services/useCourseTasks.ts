import {learningTaskService} from 'src/services/resources/learningTaskService';
import {useQuery} from '@tanstack/react-query';
import {LearningTask} from 'src/types/common/entities';

type ITask = LearningTask;

export const useCourseTasks = (courseId: string) => {
  return useQuery<ITask[], Error>({
    queryKey: ['courseTasks', courseId],
    queryFn: () => learningTaskService.getAll({course: courseId}),
  });
};
