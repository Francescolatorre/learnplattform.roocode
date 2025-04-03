import {useQuery} from '@tanstack/react-query';
import LearningTaskService from '@features/learningTasks/services/learningTaskService';

interface ITask {
  id: string;
  title: string;
  description: string;
  status: string;
}

export const useCourseTasks = (courseId: string) => {
  return useQuery<ITask[], Error>(['courseTasks', courseId], () =>
    LearningTaskService.fetchLearningTasksByCourse(courseId)
  );
};
