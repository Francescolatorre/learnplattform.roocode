import {CourseDetails, User} from '@types/common/entities';
export type {ICourse} from '../../courses/types/courseTypes';
export enum CompletionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export type CompletionStatusType = keyof typeof CompletionStatus;

export interface IEnrollment {
  readonly id: number;
  course: number;
  course_details: CourseDetails;
  user: number;
  readonly enrollment_date: string;
  status: CompletionStatus;
  readonly progress_percentage: string;
  user_details: User;
}
