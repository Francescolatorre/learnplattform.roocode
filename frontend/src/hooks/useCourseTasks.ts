import { useQuery } from '@tanstack/react-query';
import LearningTaskService from '@features/learningTasks/services/learningTaskService';
import CourseService from '@features/courses/services/courseService';

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
