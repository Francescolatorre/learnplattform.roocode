import CourseService from '@features/courses/services/courseService';
import { ICourse } from '@features/courses/types/courseTypes';
import { useQuery } from '@tanstack/react-query';

export const useCourseData = (id: string) => {
  return useQuery<ICourse, Error>({
    queryKey: ['course', id],
    queryFn: () => CourseService.fetchCourseById(Number(id)),
    enabled: !!id, // Only run the query if id is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
  });
};
