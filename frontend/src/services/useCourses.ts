import {useQuery} from '@tanstack/react-query';

import {courseService} from 'src/services/resources/courseService';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.fetchCourses(),
    refetchOnWindowFocus: false,
  });
};
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseDetails(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
