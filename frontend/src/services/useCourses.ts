import {useQuery} from '@tanstack/react-query';

import {courseService} from 'src/services/resources/courseService';

export const useCourses = () => {
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: async () => courseService.fetchCourses(),
    refetchOnWindowFocus: false,
  });
  // DEBUG: Log the result and error from useCourses
   
  console.log('[useCourses] Query data:', query.data);
  if (query.error) {
     
    console.error('[useCourses] Query error:', query.error);
  }
  return query;
};
export const useCourse = (id: string) => {
  const query = useQuery({
    queryKey: ['course', id],
    queryFn: async () => courseService.getCourseDetails(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
  // DEBUG: Log the result and error from useCourse
   
  console.log('[useCourse] Query data:', query.data);
  if (query.error) {
     
    console.error('[useCourse] Query error:', query.error);
  }
  return query;
};
