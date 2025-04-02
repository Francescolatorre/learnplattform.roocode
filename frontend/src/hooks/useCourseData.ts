import { useQuery } from '@tanstack/react-query';

import { ICourse } from '../types/courseTypes';

import CourseService from '@features/courses/services/courseService';

export const useCourseData = (id: string) => {
  return useQuery<ICourse, Error>(['course', id], () => CourseService.fetchCourseById(Number(id)));
};
