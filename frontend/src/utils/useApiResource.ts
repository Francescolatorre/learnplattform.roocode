import {useQuery} from '@tanstack/react-query';
import {courseService} from 'src/services/resources/courseService';
import {Course} from 'src/types/common/entities';

/**
 * React hook for fetching a paginated list of courses using the standardized courseService.
 * Delegates all data access and business logic to the service module, in compliance with the TypeScript Services Standardization Initiative.
export function useCourses(options: CourseFilterOptions = {}) {
  return useQuery<IPaginatedResponse<Course>, Error>({
    queryKey: ['courses', options],
    queryFn: () => courseService.fetchCourses(options),
  });
}

 /**
  * React hook for fetching a single course by ID using the standardized courseService.
  * Delegates all data access and business logic to the service module.
  */
export function useCourse(courseId: string | undefined) {
  return useQuery<Course, Error>({
    queryKey: ['course', courseId],
    queryFn: () => {
      if (!courseId) throw new Error('No courseId provided');
      return courseService.getCourseDetails(courseId);
    },
    enabled: !!courseId,
  });
}


/*
TODO: Implement useTasks, useModules, and other resource hooks using their respective service modules.
All generic data fetching hooks and business logic must be removed from this file.
See the TypeScript Services Standardization documentation for compliance requirements.
*/
