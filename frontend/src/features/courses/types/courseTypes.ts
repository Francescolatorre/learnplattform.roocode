import { Course, CourseDetails } from '../../../types/common/entities';

export enum CourseStatus {
  Active = 'active',
  Completed = 'completed',
  Dropped = 'dropped',
}

export type ICourse = Omit<
  Course,
  | 'title'
  | 'description'
  | 'version'
  | 'learning_objectives'
  | 'prerequisites'
  | 'status'
  | 'visibility'
  | 'created_at'
  | 'updated_at'
> & {
  readonly id: number;
  title: string & { length: 3 };
  description: string & { length: 10 };
  version: string;
  learning_objectives: string[];
  prerequisites: string[];
  status: CourseStatus;
  visibility: string;
  created_at: string;
  updated_at: string;
};

export type ICourseDetails = Omit<CourseDetails, 'version'>;

export interface IEnrollment {
  id: number;
  course: number;
  course_details: ICourseDetails;
  // ...other properties from the CourseEnrollment definition in Swagger
}
