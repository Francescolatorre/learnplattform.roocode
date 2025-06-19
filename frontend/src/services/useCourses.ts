import { useQuery } from '@tanstack/react-query';

import { ICourse } from '@/types/course'; // Import existing interface
import { IPaginatedResponse } from '@/types/paginatedResponse'; // Import existing interface
import { courseService } from '@services/resources/courseService';

export const useCourses = () => {
  const query = useQuery<IPaginatedResponse<ICourse>, Error>({
    queryKey: ['courses'],
    queryFn: async () => courseService.fetchCourses(),
    refetchOnWindowFocus: false,
  });

  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('[useCourses] Query data:', query.data);
    if (query.error) {
      console.error('[useCourses] Query error:', query.error);
    }
  }

  return query;
};

export const useCourse = (id: string) => {
  const query = useQuery<ICourse, Error>({
    queryKey: ['course', id],
    queryFn: async () => courseService.getCourseDetails(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('[useCourse] Query data:', query.data);
    if (query.error) {
      console.error('[useCourse] Query error:', query.error);
    }
  }

  return query;
};
