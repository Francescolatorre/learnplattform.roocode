import { Course, CourseDetails } from '../../../types/common/entities';

export type ICourse = Course;
export type ICourseDetails = CourseDetails;

export interface IEnrollment {
  id: number;
  course: number;
  course_details: ICourseDetails;
  // ...other properties from the CourseEnrollment definition in Swagger
}
