export {ICourse} from '../../courses/types/courseTypes';

export interface ICourseDetails {
  id: number;
  title: string;
  description: string;
  // ...other properties from the Course definition in Swagger
}

export interface IEnrollment {
  id: number;
  course: number;
  course_details: ICourseDetails;
  // ...other properties from the CourseEnrollment definition in Swagger
}
