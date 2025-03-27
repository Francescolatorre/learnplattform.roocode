import { useQuery } from 'react-query';
import { CourseService } from '@services/courseService'; // Use the updated CourseService

interface ITask {
    id: string;
    title: string;
    description: string;
    status: string;
}

export const useCourseTasks = (courseId: string) => {
    return useQuery<ITask[], Error>(['courseTasks', courseId], () => CourseService.getTasks(courseId));
};
