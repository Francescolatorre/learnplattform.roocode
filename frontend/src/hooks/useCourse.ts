import { useQuery } from '@tanstack/react-query';
import { ICourse } from '@features/courses/types/courseTypes';
import CourseService from '@features/courses/services/courseService';

export const useCourse = (id: string) => {
  return useQuery<ICourse, Error>({
    queryKey: ['course', id],
    queryFn: () => CourseService.fetchCourseById(Number(id)),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
