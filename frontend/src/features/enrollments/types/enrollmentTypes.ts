import { CourseDetails, User } from '@/types/common/entities';
export { ICourse } from '../../courses/types/courseTypes';

export interface IEnrollment {
  id: number;
  course: number;
  course_details: CourseDetails;
  user: number;
  enrollment_date?: string;
  status: 'active' | 'completed' | 'dropped';
  progress_percentage?: string;
  settings?: Record<string, any> | null;
  user_details?: User;
}
